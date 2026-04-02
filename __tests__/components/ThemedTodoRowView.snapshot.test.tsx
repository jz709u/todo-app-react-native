jest.mock("@/hooks/use-theme-color", () => ({
  useThemeColor: jest.fn(() => "#ffffff"),
}));

jest.mock("expo-symbols", () => ({
  SymbolView: "SymbolView",
}));

import React from "react";
import { render } from "@testing-library/react-native";
import { ThemedTodoRowView } from "@/components/themed-todo-row-view.component";

describe("ThemedTodoRowView Snapshots", () => {
  it("should render incomplete todo correctly", () => {
    const { toJSON } = render(
      <ThemedTodoRowView
        text="Incomplete Todo"
        isCompleted={false}
        toggleCompleted={jest.fn()}
      />
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it("should render completed todo correctly", () => {
    const { toJSON } = render(
      <ThemedTodoRowView
        text="Completed Todo"
        isCompleted={true}
        toggleCompleted={jest.fn()}
      />
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it("should render long text without breaking", () => {
    const longText =
      "This is a very long todo text that might wrap to multiple lines in the UI";

    const { toJSON } = render(
      <ThemedTodoRowView
        text={longText}
        isCompleted={false}
        toggleCompleted={jest.fn()}
      />
    );

    expect(toJSON()).toMatchSnapshot();
  });
});
