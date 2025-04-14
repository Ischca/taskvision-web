import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';
import 'package:flutter/material.dart';

class Block {
  final String id;
  final String title; // Same as 'name' in the other version
  final String? description;
  final DateTime? startTime;
  final DateTime? endTime;
  final int order;
  final String userId;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Color? color;
  final String? taskId;
  final bool isRecurring;
  final RecurrenceRule? recurrenceRule;
  final bool isDeleted;

  Block({
    String? id,
    required this.title,
    this.description,
    this.startTime,
    this.endTime,
    this.order = 0,
    required this.userId,
    DateTime? createdAt,
    DateTime? updatedAt,
    Color? color,
    this.taskId,
    this.isRecurring = false,
    this.recurrenceRule,
    this.isDeleted = false,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now(),
        color = color;

  Block copyWith({
    String? id,
    String? title,
    String? description,
    DateTime? startTime,
    DateTime? endTime,
    int? order,
    String? userId,
    DateTime? createdAt,
    DateTime? updatedAt,
    Color? color,
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
      order: order ?? this.order,
      userId: userId ?? this.userId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      color: color ?? this.color,
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
      'startTime': startTime != null ? Timestamp.fromDate(startTime!) : null,
      'endTime': endTime != null ? Timestamp.fromDate(endTime!) : null,
      'order': order,
      'userId': userId,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
      'color': color?.value,
      'taskId': taskId,
      'isRecurring': isRecurring,
      'recurrenceRule': recurrenceRule?.toMap(),
      'isDeleted': isDeleted,
    };
  }

  factory Block.fromMap(Map<String, dynamic> map) {
    return Block(
      id: map['id'],
      title: map['title'] ?? map['name'],
      description: map['description'],
      startTime: map['startTime'] != null
          ? (map['startTime'] is Timestamp)
              ? (map['startTime'] as Timestamp).toDate()
              : DateTime.parse(map['startTime'])
          : null,
      endTime: map['endTime'] != null
          ? (map['endTime'] is Timestamp)
              ? (map['endTime'] as Timestamp).toDate()
              : DateTime.parse(map['endTime'])
          : null,
      order: map['order'] ?? 0,
      userId: map['userId'],
      createdAt: map['createdAt'] is Timestamp
          ? (map['createdAt'] as Timestamp).toDate()
          : DateTime.parse(map['createdAt']),
      updatedAt: map['updatedAt'] is Timestamp
          ? (map['updatedAt'] as Timestamp).toDate()
          : DateTime.parse(map['updatedAt']),
      color: map['color'] != null
          ? (map['color'] is int)
              ? Color(map['color'])
              : Color(int.parse(map['color']))
          : null,
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
    return Block(
      id: doc.id,
      title: data['title'] ?? data['name'] ?? '',
      description: data['description'],
      startTime: data['startTime'] != null
          ? (data['startTime'] as Timestamp).toDate()
          : null,
      endTime: data['endTime'] != null
          ? (data['endTime'] as Timestamp).toDate()
          : null,
      order: data['order'] ?? 0,
      userId: data['userId'] ?? '',
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      updatedAt: (data['updatedAt'] as Timestamp).toDate(),
      color: data['color'] != null ? Color(data['color']) : null,
      taskId: data['taskId'],
      isRecurring: data['isRecurring'] ?? false,
      recurrenceRule: data['recurrenceRule'] != null
          ? RecurrenceRule.fromMap(data['recurrenceRule'])
          : null,
      isDeleted: data['isDeleted'] ?? false,
    );
  }

  Duration? get duration {
    if (startTime == null || endTime == null) return null;
    return endTime!.difference(startTime!);
  }

  bool isOverlapping(Block other) {
    if (startTime == null || endTime == null || 
        other.startTime == null || other.endTime == null) return false;
    return (startTime!.isBefore(other.endTime!) && endTime!.isAfter(other.startTime!));
  }

  bool isInDay(DateTime day) {
    if (startTime == null || endTime == null) return false;
    final startOfDay = DateTime(day.year, day.month, day.day);
    final endOfDay = startOfDay.add(const Duration(days: 1));
    return (startTime!.isBefore(endOfDay) && endTime!.isAfter(startOfDay));
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
