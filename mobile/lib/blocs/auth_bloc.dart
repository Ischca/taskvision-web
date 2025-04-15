import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/auth_service.dart';
import '../services/firebase_service.dart';

// Events
abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object> get props => [];
}

class AuthCheckRequested extends AuthEvent {}

class SignInRequested extends AuthEvent {
  final String email;
  final String password;

  const SignInRequested({
    required this.email,
    required this.password,
  });

  @override
  List<Object> get props => [email, password];
}

class SignUpRequested extends AuthEvent {
  final String email;
  final String password;

  const SignUpRequested({
    required this.email,
    required this.password,
  });

  @override
  List<Object> get props => [email, password];
}

class GoogleSignInRequested extends AuthEvent {}

class AppleSignInRequested extends AuthEvent {}

class PasswordResetRequested extends AuthEvent {
  final String email;

  const PasswordResetRequested({
    required this.email,
  });

  @override
  List<Object> get props => [email];
}

class SignOutRequested extends AuthEvent {}

// States
abstract class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object> get props => [];
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class Authenticated extends AuthState {
  final User user;

  const Authenticated(this.user);

  @override
  List<Object> get props => [user.uid];
}

class Unauthenticated extends AuthState {}

class AuthFailure extends AuthState {
  final String message;

  const AuthFailure(this.message);

  @override
  List<Object> get props => [message];
}

// BLoC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthService authService;
  final FirebaseService firebaseService;

  AuthBloc({required this.authService, required this.firebaseService}) : super(AuthInitial()) {
    on<AuthCheckRequested>(_onAuthCheckRequested);
    on<SignInRequested>(_onSignInRequested);
    on<SignUpRequested>(_onSignUpRequested);
    on<GoogleSignInRequested>(_onGoogleSignInRequested);
    on<AppleSignInRequested>(_onAppleSignInRequested);
    on<PasswordResetRequested>(_onPasswordResetRequested);
    on<SignOutRequested>(_onSignOutRequested);
  }

  void _onAuthCheckRequested(
    AuthCheckRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    
    final user = firebaseService.currentUser;
    
    if (user != null) {
      emit(Authenticated(user));
    } else {
      emit(Unauthenticated());
    }
  }

  void _onSignInRequested(
    SignInRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    
    try {
      final userCredential = await authService.signInWithEmailAndPassword(
        event.email,
        event.password,
      );
      
      if (userCredential.user != null) {
        emit(Authenticated(userCredential.user!));
      } else {
        emit(const AuthFailure('ログインに失敗しました。もう一度お試しください。'));
      }
    } on FirebaseAuthException catch (e) {
      emit(AuthFailure(authService.getErrorMessageFromCode(e.code)));
    } catch (e) {
      emit(const AuthFailure('ログインに失敗しました。もう一度お試しください。'));
    }
  }

  void _onSignUpRequested(
    SignUpRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    
    try {
      final userCredential = await authService.registerWithEmailAndPassword(
        event.email,
        event.password,
      );
      
      if (userCredential.user != null) {
        emit(Authenticated(userCredential.user!));
      } else {
        emit(const AuthFailure('アカウント登録に失敗しました。もう一度お試しください。'));
      }
    } on FirebaseAuthException catch (e) {
      emit(AuthFailure(authService.getErrorMessageFromCode(e.code)));
    } catch (e) {
      emit(const AuthFailure('アカウント登録に失敗しました。もう一度お試しください。'));
    }
  }

  void _onGoogleSignInRequested(
    GoogleSignInRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    
    try {
      final userCredential = await authService.signInWithGoogle();
      
      if (userCredential != null && userCredential.user != null) {
        emit(Authenticated(userCredential.user!));
      } else {
        emit(Unauthenticated());
      }
    } catch (e) {
      emit(const AuthFailure('Googleログインに失敗しました。もう一度お試しください。'));
    }
  }

  void _onAppleSignInRequested(
    AppleSignInRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    
    try {
      final userCredential = await authService.signInWithApple();
      
      if (userCredential != null && userCredential.user != null) {
        emit(Authenticated(userCredential.user!));
      } else {
        emit(Unauthenticated());
      }
    } catch (e) {
      emit(const AuthFailure('Appleログインに失敗しました。もう一度お試しください。'));
    }
  }

  void _onPasswordResetRequested(
    PasswordResetRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    
    try {
      await FirebaseAuth.instance.sendPasswordResetEmail(
        email: event.email,
      );
      emit(const AuthFailure('パスワードリセットメールを送信しました。メールをご確認ください。'));
    } on FirebaseAuthException catch (e) {
      emit(AuthFailure(authService.getErrorMessageFromCode(e.code)));
    } catch (e) {
      emit(const AuthFailure('パスワードリセットメールの送信に失敗しました。'));
    }
  }

  void _onSignOutRequested(
    SignOutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    
    try {
      await authService.signOut();
      emit(Unauthenticated());
    } catch (e) {
      emit(const AuthFailure('ログアウトに失敗しました。もう一度お試しください。'));
    }
  }
}
