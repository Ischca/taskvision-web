FROM ubuntu:22.04

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Set environment variables
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV FLUTTER_HOME=/opt/flutter
ENV PATH=${PATH}:${FLUTTER_HOME}/bin:${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin:${ANDROID_SDK_ROOT}/platform-tools

# Install required packages
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    xz-utils \
    zip \
    libglu1-mesa \
    openjdk-11-jdk \
    wget \
    clang \
    cmake \
    ninja-build \
    pkg-config \
    libgtk-3-dev \
    liblzma-dev \
    libstdc++-12-dev \
    libpulse0 \
    libpulse-dev \
    && rm -rf /var/lib/apt/lists/*

# Create directories
RUN mkdir -p ${ANDROID_SDK_ROOT} && \
    mkdir -p /workspace

# Download and install Android SDK
RUN cd /tmp && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && \
    unzip commandlinetools-linux-9477386_latest.zip -d ${ANDROID_SDK_ROOT} && \
    mkdir -p ${ANDROID_SDK_ROOT}/cmdline-tools/latest && \
    mv ${ANDROID_SDK_ROOT}/cmdline-tools/* ${ANDROID_SDK_ROOT}/cmdline-tools/latest/ 2>/dev/null || true && \
    rm commandlinetools-linux-9477386_latest.zip

# Accept Android SDK licenses
RUN yes | sdkmanager --licenses

# Install Android SDK components
RUN sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.2" \
    "system-images;android-33;google_apis;x86_64" \
    "emulator"

# Download and install Flutter
RUN cd /opt && \
    git clone https://github.com/flutter/flutter.git -b stable && \
    flutter/bin/flutter precache && \
    flutter/bin/flutter doctor

# Set up Flutter for Android development
RUN /opt/flutter/bin/flutter config --no-analytics && \
    /opt/flutter/bin/flutter config --android-sdk ${ANDROID_SDK_ROOT}

# Create a non-root user
RUN useradd -ms /bin/bash developer
RUN chown -R developer:developer /workspace
RUN chown -R developer:developer ${FLUTTER_HOME}
RUN chown -R developer:developer ${ANDROID_SDK_ROOT}

# Switch to the non-root user
USER developer
WORKDIR /workspace

# Pre-download Flutter dependencies
RUN /opt/flutter/bin/flutter precache

# Verify installation
RUN /opt/flutter/bin/flutter doctor -v

# Set the entrypoint
ENTRYPOINT ["/bin/bash"]
