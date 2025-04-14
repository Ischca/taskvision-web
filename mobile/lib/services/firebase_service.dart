import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

class FirebaseService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Auth
  User? get currentUser => _auth.currentUser;
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // Firestore collections
  CollectionReference get tasksCollection => _firestore.collection('tasks');
  CollectionReference get blocksCollection => _firestore.collection('blocks');
  CollectionReference get remindersCollection => _firestore.collection('reminders');

  // Auth methods
  Future<UserCredential> signInWithEmailAndPassword(String email, String password) async {
    try {
      return await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
    } catch (e) {
      debugPrint('Error signing in: $e');
      rethrow;
    }
  }

  Future<UserCredential> createUserWithEmailAndPassword(String email, String password) async {
    try {
      return await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
    } catch (e) {
      debugPrint('Error creating user: $e');
      rethrow;
    }
  }

  Future<void> signOut() async {
    try {
      await _auth.signOut();
    } catch (e) {
      debugPrint('Error signing out: $e');
      rethrow;
    }
  }

  // Firestore methods
  Future<void> addDocument(CollectionReference collection, Map<String, dynamic> data) async {
    try {
      await collection.add(data);
    } catch (e) {
      debugPrint('Error adding document: $e');
      rethrow;
    }
  }

  Future<void> updateDocument(CollectionReference collection, String docId, Map<String, dynamic> data) async {
    try {
      await collection.doc(docId).update(data);
    } catch (e) {
      debugPrint('Error updating document: $e');
      rethrow;
    }
  }

  Future<void> deleteDocument(CollectionReference collection, String docId) async {
    try {
      await collection.doc(docId).delete();
    } catch (e) {
      debugPrint('Error deleting document: $e');
      rethrow;
    }
  }

  Stream<QuerySnapshot> getDocuments(CollectionReference collection, {String? field, dynamic value}) {
    try {
      if (field != null && value != null) {
        return collection.where(field, isEqualTo: value).snapshots();
      }
      return collection.snapshots();
    } catch (e) {
      debugPrint('Error getting documents: $e');
      rethrow;
    }
  }
}
