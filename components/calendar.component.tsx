import { ThemedText } from "@/components/themed-text";
import React from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

export interface CalendarProps {
  currentDate: Date;
  selectedDate: number | null;
  onMonthChange: (direction: "prev" | "next") => void;
  onDateSelect: (day: number) => void;
  renderDay?: (props: CalendarDayRenderProps) => React.ReactElement | null;
}

export interface CalendarDayRenderProps {
  day: number | null;
  isSelected: boolean;
  isToday: boolean;
  currentDate: Date;
}

export function Calendar({
  currentDate,
  selectedDate,
  onMonthChange,
  onDateSelect,
  renderDay,
}: CalendarProps) {
  const getDaysInMonth = () => {
    return new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    ).getDate();
  };

  const getFirstDayOfMonth = () => {
    return new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    ).getDay();
  };

  const daysInMonth = getDaysInMonth();
  const firstDay = getFirstDayOfMonth();
  const days: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete the 6-week grid (42 days total)
  while (days.length < 42) {
    days.push(null);
  }

  const today = new Date();
  const isCurrentMonth =
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

  return (
    <View style={styles.container}>
      {/* Month Header */}
      <View style={styles.monthHeader}>
        <Pressable onPress={() => onMonthChange("prev")}>
          <ThemedText style={styles.navButton}>←</ThemedText>
        </Pressable>
        <ThemedText style={styles.monthTitle}>
          {currentDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </ThemedText>
        <Pressable onPress={() => onMonthChange("next")}>
          <ThemedText style={styles.navButton}>→</ThemedText>
        </Pressable>
      </View>

      {/* Day Headers */}
      <View style={styles.dayHeadersContainer}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <ThemedText key={day} style={styles.dayHeader}>
            {day}
          </ThemedText>
        ))}
      </View>

      {/* Calendar Grid */}
      <FlatList
        data={days}
        numColumns={7}
        renderItem={({ item: day }) => {
          const isToday = isCurrentMonth && day === today.getDate();
          const isSelected = day === selectedDate;

          if (renderDay) {
            return renderDay({
              day,
              isSelected,
              isToday,
              currentDate,
            });
          }

          return (
            <DefaultCalendarDay
              day={day}
              isSelected={isSelected}
              isToday={isToday}
              onPress={() => day && onDateSelect(day)}
            />
          );
        }}
        keyExtractor={(item, index) => index.toString()}
        scrollEnabled={false}
      />
    </View>
  );
}

interface DefaultCalendarDayProps {
  day: number | null;
  isSelected: boolean;
  isToday: boolean;
  onPress: () => void;
}

function DefaultCalendarDay({
  day,
  isSelected,
  isToday,
  onPress,
}: DefaultCalendarDayProps) {
  if (day === null) {
    return <View style={styles.emptyDayCell} />;
  }

  return (
    <Pressable
      style={[
        styles.dayCell,
        isSelected && styles.selectedDayCell,
        isToday && styles.todayCell,
      ]}
      onPress={onPress}
    >
      <ThemedText
        style={[
          styles.dayNumber,
          isSelected && styles.selectedDayNumber,
          isToday && styles.todayNumber,
        ]}
      >
        {day}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
  },
  navButton: {
    fontSize: 20,
    fontWeight: "bold",
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dayHeadersContainer: {
    flexDirection: "row",
    gap: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    flexBasis: "14.28%",
    padding: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
  },
  emptyDayCell: {
    flex: 1,
    aspectRatio: 1,
    flexBasis: "14.28%",
    backgroundColor: "transparent",
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: "600",
  },
  todayCell: {
    backgroundColor: "#E8F4FD",
    borderColor: "#3C88DF",
    borderWidth: 2,
  },
  todayNumber: {
    color: "#3C88DF",
  },
  selectedDayCell: {
    backgroundColor: "#3C88DF",
    borderColor: "#2563EB",
  },
  selectedDayNumber: {
    color: "#fff",
  },
});
