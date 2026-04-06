const appJson = require("./app.json");

function sanitizeName(name) {
  return (name || "App")
    .replace(/[\W_]+/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") || "App";
}

module.exports = () => {
  const expoConfig = appJson.expo;
  const projectName = sanitizeName(expoConfig.name || expoConfig.slug);
  const bundleIdentifier =
    expoConfig.ios?.bundleIdentifier || "com.example.todoapp";
  const extensionName = `${projectName}AppIntentsExtension`;
  const existingPlugins = expoConfig.plugins || [];
  const plugins = existingPlugins.includes("./plugins/with-siri-app-intent")
    ? existingPlugins
    : [...existingPlugins, "./plugins/with-siri-app-intent"];

  const existingExtensions =
    expoConfig.extra?.eas?.build?.experimental?.ios?.appExtensions || [];
  const appExtensions = [
    ...existingExtensions.filter(
      (extension) => extension.targetName !== extensionName,
    ),
    {
      targetName: extensionName,
      bundleIdentifier: `${bundleIdentifier}.appintents`,
    },
  ];

  return {
    ...expoConfig,
    ios: {
      ...expoConfig.ios,
      bundleIdentifier,
    },
    plugins,
    extra: {
      ...expoConfig.extra,
      eas: {
        ...expoConfig.extra?.eas,
        build: {
          ...expoConfig.extra?.eas?.build,
          experimental: {
            ...expoConfig.extra?.eas?.build?.experimental,
            ios: {
              ...expoConfig.extra?.eas?.build?.experimental?.ios,
              appExtensions,
            },
          },
        },
      },
    },
  };
};
