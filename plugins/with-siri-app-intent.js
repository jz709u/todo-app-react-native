const fs = require("fs");
const path = require("path");
const {
  IOSConfig,
  createRunOncePlugin,
  withDangerousMod,
  withXcodeProject,
} = require("@expo/config-plugins");
const {
  addBuildSourceFileToGroup,
  addResourceFileToGroup,
  ensureGroupRecursively,
} = require("@expo/config-plugins/build/ios/utils/Xcodeproj");

const PLUGIN_NAME = "with-siri-app-intent";
const PLUGIN_VERSION = "1.0.0";
const APP_INTENTS_DEPLOYMENT_TARGET = "16.0";
const COPY_FILES_PHASE_NAME = "Embed App Extensions";

function sanitizeName(name) {
  return IOSConfig.XcodeUtils.sanitizedName(name || "App");
}

function getScheme(config) {
  if (Array.isArray(config.scheme)) {
    return config.scheme[0] || "todoapp";
  }

  return config.scheme || "todoapp";
}

function getExtensionConfig(config, projectName) {
  const extensionName = `${projectName}AppIntentsExtension`;
  const appBundleIdentifier =
    config.ios?.bundleIdentifier || "com.example.todoapp";

  return {
    appScheme: getScheme(config),
    appBundleIdentifier,
    extensionBundleIdentifier: `${appBundleIdentifier}.appintents`,
    extensionName,
    extensionFolder: extensionName,
  };
}

function createInfoPlist(extensionName) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>$(DEVELOPMENT_LANGUAGE)</string>
  <key>CFBundleDisplayName</key>
  <string>${extensionName}</string>
  <key>CFBundleExecutable</key>
  <string>$(EXECUTABLE_NAME)</string>
  <key>CFBundleIdentifier</key>
  <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>$(PRODUCT_NAME)</string>
  <key>CFBundlePackageType</key>
  <string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
  <key>CFBundleShortVersionString</key>
  <string>1.0</string>
  <key>CFBundleVersion</key>
  <string>1</string>
  <key>NSExtension</key>
  <dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.intents-service</string>
  </dict>
</dict>
</plist>
`;
}

function createExtensionEntrypoint(extensionName) {
  return `import AppIntents

@main
struct ${extensionName}: AppIntentsExtension {}
`;
}

function createIntentSource({ appScheme }) {
  return `import AppIntents
import Foundation

@available(iOS 18.2, *)
struct CreateTodoIntent: AppIntent {
  static let title: LocalizedStringResource = "Create Todo"
  static let description = IntentDescription("Create a todo in the app using Siri or Shortcuts.")

  @Parameter(
    title: "Title",
    requestValueDialog: IntentDialog("What todo should I create?")
  )
  var title: String

  @Parameter(title: "Priority")
  var priority: TodoPriority?

  static var parameterSummary: some ParameterSummary {
    Summary("Create todo \\(\\.$title)")
  }

  func perform() async throws -> some IntentResult & ProvidesDialog & OpensIntent {
    var components = URLComponents()
    components.scheme = "${appScheme}"
    components.host = "siri-create-todo"
    components.queryItems = [
      URLQueryItem(name: "title", value: title),
    ]

    if let priority {
      components.queryItems?.append(
        URLQueryItem(name: "priority", value: priority.rawValue)
      )
    }

    guard let url = components.url else {
      throw $title.needsValueError("A todo title is required.")
    }

    return .result(
      opensIntent: OpenURLIntent(url),
      dialog: IntentDialog("Adding \\(title) to your todos.")
    )
  }
}

enum TodoPriority: String, AppEnum {
  case low
  case medium
  case high

  static let typeDisplayRepresentation = TypeDisplayRepresentation(name: "Priority")

  static let caseDisplayRepresentations: [TodoPriority: DisplayRepresentation] = [
    .low: DisplayRepresentation(title: "Low"),
    .medium: DisplayRepresentation(title: "Medium"),
    .high: DisplayRepresentation(title: "High"),
  ]
}

@available(iOS 18.2, *)
struct TodoAppShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: CreateTodoIntent(),
      phrases: [
        "Create a todo in \\(.applicationName)",
        "Add a todo in \\(.applicationName)",
      ],
      shortTitle: "Create Todo",
      systemImageName: "checklist"
    )
  }
}
`;
}

function ensurePhase(project, targetUuid, isa, comment) {
  const existing = project.hash.project.objects[isa] || {};
  const target = project.pbxNativeTargetSection()[targetUuid];
  const phaseExists = (target.buildPhases || []).some((phase) => {
    const phaseCommentKey = `${phase.value}_comment`;
    return existing[phaseCommentKey] === comment;
  });

  if (!phaseExists) {
    project.addBuildPhase([], isa, comment, targetUuid);
  }
}

function ensureCopyFilesPhaseName(project) {
  const phases = project.hash.project.objects.PBXCopyFilesBuildPhase || {};

  Object.keys(phases).forEach((key) => {
    if (key.endsWith("_comment") && phases[key] === "Copy Files") {
      phases[key] = COPY_FILES_PHASE_NAME;
    }
  });
}

function ensureExtensionGroup(project, extensionName) {
  if (project.pbxGroupByName(extensionName)) {
    return;
  }

  const group = project.addPbxGroup([], extensionName, extensionName);
  const firstProject = project.getFirstProject().firstProject;
  const mainGroup = project.getPBXGroupByKey(firstProject.mainGroup);
  mainGroup.children.push({
    value: group.uuid,
    comment: extensionName,
  });
  ensureGroupRecursively(project, extensionName);
}

function findExtensionTarget(project, extensionName) {
  const targets = project.pbxNativeTargetSection();

  return Object.entries(targets).find(([key, target]) => {
    if (key.endsWith("_comment") || !target?.name) {
      return false;
    }

    return target.name === `"${extensionName}"` || target.name === extensionName;
  });
}

function configureBuildSettings(
  project,
  targetEntry,
  extensionName,
  extensionBundleIdentifier,
) {
  if (!targetEntry) {
    return;
  }

  const settings = {
    APPLICATION_EXTENSION_API_ONLY: "YES",
    IPHONEOS_DEPLOYMENT_TARGET: APP_INTENTS_DEPLOYMENT_TARGET,
    LD_RUNPATH_SEARCH_PATHS:
      '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"',
    PRODUCT_BUNDLE_IDENTIFIER: `"${extensionBundleIdentifier}"`,
    PRODUCT_NAME: `"${extensionName}"`,
    SKIP_INSTALL: "YES",
    SWIFT_VERSION: "5.0",
    TARGETED_DEVICE_FAMILY: '"1,2"',
  };

  const [, target] = targetEntry;
  const configList = project.pbxXCConfigurationList()[target.buildConfigurationList];
  if (!configList?.buildConfigurations) {
    return;
  }

  configList.buildConfigurations.forEach(({ value }) => {
    const config = project.pbxXCBuildConfigurationSection()[value];
    if (!config?.buildSettings) {
      return;
    }

    Object.entries(settings).forEach(([key, settingValue]) => {
      config.buildSettings[key] = settingValue;
    });
  });
}

function addExtensionFiles(project, extensionName, targetUuid) {
  const sourceFiles = [`${extensionName}.swift`, "CreateTodoIntent.swift"];
  const resourceFiles = [`${extensionName}-Info.plist`];

  sourceFiles.forEach((filepath) => {
    addBuildSourceFileToGroup({
      filepath,
      groupName: extensionName,
      project,
      targetUuid,
      verbose: true,
    });
  });

  resourceFiles.forEach((filepath) => {
    addResourceFileToGroup({
      filepath,
      groupName: extensionName,
      isBuildFile: false,
      project,
      targetUuid,
      verbose: true,
    });
  });
}

function normalizeExtensionFileReferences(project, extensionName) {
  const fileReferences = project.pbxFileReferenceSection();
  const expectedFiles = new Set([
    `${extensionName}.swift`,
    "CreateTodoIntent.swift",
    `${extensionName}-Info.plist`,
  ]);

  Object.entries(fileReferences).forEach(([key, fileReference]) => {
    if (key.endsWith("_comment") || !fileReference?.name) {
      return;
    }

    const name = String(fileReference.name).replace(/^"|"$/g, "");
    if (!expectedFiles.has(name)) {
      return;
    }

    fileReference.path = name;
    fileReference.sourceTree = '"<group>"';
  });
}

const withSiriAppIntent = (config) => {
  config = withDangerousMod(config, [
    "ios",
    async (modConfig) => {
      const projectName =
        modConfig.modRequest.projectName || sanitizeName(modConfig.name);
      const extensionConfig = getExtensionConfig(modConfig, projectName);
      const iosRoot = path.join(
        modConfig.modRequest.platformProjectRoot,
        extensionConfig.extensionFolder,
      );

      await fs.promises.mkdir(iosRoot, { recursive: true });

      await fs.promises.writeFile(
        path.join(
          iosRoot,
          `${extensionConfig.extensionName}-Info.plist`,
        ),
        createInfoPlist(extensionConfig.extensionName),
      );
      await fs.promises.writeFile(
        path.join(iosRoot, `${extensionConfig.extensionName}.swift`),
        createExtensionEntrypoint(extensionConfig.extensionName),
      );
      await fs.promises.writeFile(
        path.join(iosRoot, "CreateTodoIntent.swift"),
        createIntentSource(extensionConfig),
      );

      return modConfig;
    },
  ]);

  config = withXcodeProject(config, (modConfig) => {
    const project = modConfig.modResults;
    const projectName =
      modConfig.modRequest.projectName || sanitizeName(modConfig.name);
    const {
      extensionBundleIdentifier,
      extensionName,
    } = getExtensionConfig(modConfig, projectName);

    let targetEntry = findExtensionTarget(project, extensionName);

    if (!targetEntry) {
      ensureExtensionGroup(project, extensionName);

      const target = project.addTarget(
        extensionName,
        "app_extension",
        extensionName,
        extensionBundleIdentifier,
      );
      targetEntry = [target.uuid, target.pbxNativeTarget];

      ensureCopyFilesPhaseName(project);
      ensurePhase(project, target.uuid, "PBXSourcesBuildPhase", "Sources");
      ensurePhase(project, target.uuid, "PBXResourcesBuildPhase", "Resources");
      ensurePhase(project, target.uuid, "PBXFrameworksBuildPhase", "Frameworks");

      project.addTargetAttribute("ProvisioningStyle", "Automatic", target);

      addExtensionFiles(project, extensionName, target.uuid);
    }

    configureBuildSettings(
      project,
      targetEntry,
      extensionName,
      extensionBundleIdentifier,
    );
    normalizeExtensionFileReferences(project, extensionName);

    return modConfig;
  });

  return config;
};

module.exports = createRunOncePlugin(
  withSiriAppIntent,
  PLUGIN_NAME,
  PLUGIN_VERSION,
);
