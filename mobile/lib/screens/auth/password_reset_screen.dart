import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../utils/constants.dart';
import '../../blocs/auth_bloc.dart';

class PasswordResetScreen extends StatefulWidget {
  const PasswordResetScreen({super.key});

  @override
  State<PasswordResetScreen> createState() => _PasswordResetScreenState();
}

class _PasswordResetScreenState extends State<PasswordResetScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;
  bool _resetEmailSent = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  void _resetPassword() {
    if (_formKey.currentState!.validate()) {
      context.read<AuthBloc>().add(
            PasswordResetRequested(
              email: _emailController.text.trim(),
            ),
          );
    }
  }

  String _getErrorMessage(String errorCode) {
    switch (errorCode) {
      case 'invalid-email':
        return 'メールアドレスの形式が正しくありません。';
      case 'user-not-found':
        return 'このメールアドレスに関連するアカウントが見つかりません。';
      case 'too-many-requests':
        return 'リクエストが多すぎます。しばらく経ってからもう一度お試しください。';
      default:
        return 'エラーが発生しました: $errorCode';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('パスワードをリセット'),
      ),
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthLoading) {
            setState(() {
              _isLoading = true;
              _errorMessage = null;
            });
          } else if (state is AuthFailure) {
            setState(() {
              _isLoading = false;
              if (state.message.contains('パスワードリセットメールを送信しました')) {
                _resetEmailSent = true;
              } else {
                _errorMessage = state.message;
              }
            });
          }
        },
        builder: (context, state) {
          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: _resetEmailSent ? _buildSuccessContent() : _buildResetForm(),
          );
        },
      ),
    );
  }

  Widget _buildResetForm() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'パスワードをリセットするためのリンクを送信します。',
            style: TextStyle(fontSize: 16),
          ),
          const SizedBox(height: 24),
          TextFormField(
            controller: _emailController,
            decoration: const InputDecoration(
              labelText: 'メールアドレス',
              prefixIcon: Icon(Icons.email),
            ),
            keyboardType: TextInputType.emailAddress,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'メールアドレスを入力してください';
              }
              if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$')
                  .hasMatch(value)) {
                return '有効なメールアドレスを入力してください';
              }
              return null;
            },
          ),
          if (_errorMessage != null) ...[
            const SizedBox(height: 16),
            Text(
              _errorMessage!,
              style: const TextStyle(color: AppColors.error),
            ),
          ],
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _isLoading ? null : _resetPassword,
            child: _isLoading
                ? const CircularProgressIndicator()
                : const Text('リセットリンクを送信'),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccessContent() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const Icon(
          Icons.check_circle,
          color: Colors.green,
          size: 64,
        ),
        const SizedBox(height: 24),
        const Text(
          'パスワードリセットのメールを送信しました',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 16),
        Text(
          '${_emailController.text} にパスワードリセットのリンクを送信しました。メールをご確認ください。',
          style: const TextStyle(fontSize: 16),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: () {
            Navigator.pop(context);
          },
          child: const Text('ログイン画面に戻る'),
        ),
      ],
    );
  }
}
