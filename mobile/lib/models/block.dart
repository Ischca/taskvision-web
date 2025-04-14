import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';
import 'package:flutter/material.dart';

class Block {
  final String id;
  final String title;
  final String? description;
  final DateTime startTime;
  final DateTime endTime;
  final Color color;
  final String userId;
  final String? taskId;
  final bool isRecurring;
  final RecurrenceRule? recurrenceRule;
  final bool isDeleted;

  Block({
    String? id,
    required this.title,
    this.description,
    required this.startTime,
    required this.endTime,
    Color? color,
    required this.userId,
    this.taskId,
    this.isRecurring = false,
    this.recurrenceRule,
    this.isDeleted = false,
  })  : id = id ?? const Uuid().v4(),
        color = color ?? Colors.blue;

  Block copyWith({
    String? id,
    String? title,
    String? description,
    DateTime? startTime,
    DateTime? endTime,
    Color? color,
    String? userId,
    String? taskId,
    bool? isRecurring,
    RecurrenceRule? recurrenceRule,
    bool? isDeleted,
  }) {
    return Block(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      color: color ?? this.color,
      userId: userId ?? this.userId,
      taskId: taskId ?? this.taskId,
      isRecurring: isRecurring ?? this.isRecurring,
      recurrenceRule: recurrenceRule ?? this.recurrenceRule,
      isDeleted: isDeleted ?? this.isDeleted,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'startTime': Timestamp.fromDate(startTime),
      'endTime': Timestamp.fromDate(endTime),
      'color': color.value,
      'userId': userId,
      'taskId': taskId,
      'isRecurring': isRecurring,
      'recurrenceRule': recurrenceRule?.toMap(),
      'isDeleted': isDeleted,
    };
  }

  factory Block.fromMap(Map<String, dynamic> map) {
    return Block(
      id: map['id'],
      title: map['title'],
      description: map['description'],
      startTime: (map['startTime'] as Timestamp).toDate(),
      endTime: (map['endTime'] as Timestamp).toDate(),
      color: Color(map['color']),
      userId: map['userId'],
      taskId: map['taskId'],
      isRecurring: map['isRecurring'] ?? false,
      recurrenceRule: map['recurrenceRule'] != null
          ? RecurrenceRule.fromMap(map['recurrenceRule'])
          : null,
      isDeleted: map['isDeleted'] ?? false,
    );
  }

  factory Block.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Block.fromMap(data);
  }

  Duration get duration {
    return endTime.difference(startTime);
  }

  bool isOverlapping(Block other) {
    return (startTime.isBefore(other.endTime) && endTime.isAfter(other.startTime));
  }

  bool isInDay(DateTime day) {
    final startOfDay = DateTime(day.year, day.month, day.day);
    final endOfDay = startOfDay.add(const Duration(days: 1));
    return (startTime.isBefore(endOfDay) && endTime.isAfter(startOfDay));
  }
}

enum RecurrenceFrequency {
  daily,
  weekly,
  monthly,
  yearly,
}

class RecurrenceRule {
  final RecurrenceFrequency frequency;
  final int interval;
  final List<int>? byDayOfWeek; // 1-7 for Monday-Sunday
  final List<int>? byDayOfMonth; // 1-31
  final List<int>? byMonthOfYear; // 1-12
  final DateTime? until;
  final int? count;

  RecurrenceRule({
    required this.frequency,
    this.interval = 1,
    this.byDayOfWeek,
    this.byDayOfMonth,
    this.byMonthOfYear,
    this.until,
    this.count,
  });

  Map<String, dynamic> toMap() {
    return {
      'frequency': frequency.index,
      'interval': interval,
      'byDayOfWeek': byDayOfWeek,
      'byDayOfMonth': byDayOfMonth,
      'byMonthOfYear': byMonthOfYear,
      'until': until != null ? Timestamp.fromDate(until!) : null,
      'count': count,
    };
  }

  factory RecurrenceRule.fromMap(Map<String, dynamic> map) {
    return RecurrenceRule(
      frequency: RecurrenceFrequency.values[map['frequency']],
      interval: map['interval'] ?? 1,
      byDayOfWeek: map['byDayOfWeek'] != null
          ? List<int>.from(map['byDayOfWeek'])
          : null,
      byDayOfMonth: map['byDayOfMonth'] != null
          ? List<int>.from(map['byDayOfMonth'])
          : null,
      byMonthOfYear: map['byMonthOfYear'] != null
          ? List<int>.from(map['byMonthOfYear'])
          : null,
      until: map['until'] != null ? (map['until'] as Timestamp).toDate() : null,
      count: map['count'],
    );
  }

  List<DateTime> getOccurrences(DateTime start, DateTime end, DateTime firstOccurrence) {
    final List<DateTime> occurrences = [];
    DateTime current = firstOccurrence;

    // Handle count limit
    int remainingCount = count ?? -1;

    while ((until == null || current.isBefore(until!)) &&
        current.isBefore(end) &&
        (remainingCount == -1 || remainingCount > 0)) {
      if (current.isAfter(start) || current.isAtSameMomentAs(start)) {
        occurrences.add(current);
        if (remainingCount > 0) remainingCount--;
      }

      // Calculate next occurrence based on frequency
      switch (frequency) {
        case RecurrenceFrequency.daily:
          current = current.add(Duration(days: interval));
          break;
        case RecurrenceFrequency.weekly:
          if (byDayOfWeek != null && byDayOfWeek!.isNotEmpty) {
            // Find the next day of week in the list
            int currentDayOfWeek = current.weekday;
            int? nextDayOfWeek;
            for (int day in byDayOfWeek!) {
              if (day > currentDayOfWeek) {
                nextDayOfWeek = day;
                break;
              }
            }
            if (nextDayOfWeek != null) {
              current = current.add(Duration(days: nextDayOfWeek - currentDayOfWeek));
            } else {
              // Move to the first day of next week
              current = current.add(Duration(days: 7 - currentDayOfWeek + byDayOfWeek!.first));
            }
          } else {
            current = current.add(Duration(days: 7 * interval));
          }
          break;
        case RecurrenceFrequency.monthly:
          if (byDayOfMonth != null && byDayOfMonth!.isNotEmpty) {
            // Find the next day of month in the list
            int currentDayOfMonth = current.day;
            int? nextDayOfMonth;
            for (int day in byDayOfMonth!) {
              if (day > currentDayOfMonth && day <= _daysInMonth(current.year, current.month)) {
                nextDayOfMonth = day;
                break;
              }
            }
            if (nextDayOfMonth != null) {
              current = DateTime(current.year, current.month, nextDayOfMonth);
            } else {
              // Move to the first day of next month
              current = DateTime(current.year, current.month + interval, byDayOfMonth!.first);
            }
          } else {
            // Simple monthly recurrence
            int newMonth = current.month + interval;
            int newYear = current.year;
            while (newMonth > 12) {
              newMonth -= 12;
              newYear++;
            }
            int day = current.day;
            int daysInMonth = _daysInMonth(newYear, newMonth);
            if (day > daysInMonth) day = daysInMonth;
            current = DateTime(newYear, newMonth, day);
          }
          break;
        case RecurrenceFrequency.yearly:
          if (byMonthOfYear != null && byMonthOfYear!.isNotEmpty) {
            // Find the next month in the list
            int currentMonth = current.month;
            int? nextMonth;
            for (int month in byMonthOfYear!) {
              if (month > currentMonth) {
                nextMonth = month;
                break;
              }
            }
            if (nextMonth != null) {
              current = DateTime(current.year, nextMonth, current.day);
            } else {
              // Move to the first month of next year
              current = DateTime(current.year + interval, byMonthOfYear!.first, current.day);
            }
          } else {
            // Simple yearly recurrence
            current = DateTime(current.year + interval, current.month, current.day);
          }
          break;
      }
    }

    return occurrences;
  }

  // Helper method to get days in a month
  int _daysInMonth(int year, int month) {
    return DateTime(year, month + 1, 0).day;
  }
}
