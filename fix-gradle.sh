#!/bin/bash
echo "=== Fixing gradle-wrapper.properties ==="
cat > android/gradle/wrapper/gradle-wrapper.properties << 'PROPEOF'
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.4-all.zip
networkTimeout=120000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
PROPEOF
cat android/gradle/wrapper/gradle-wrapper.properties

echo "=== Fixing build.gradle ==="
cat > android/build.gradle << 'BUILDEOF'
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
        classpath 'com.google.gms:google-services:4.4.0'
    }
}

apply from: "variables.gradle"

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
BUILDEOF

echo "=== Fixing variables.gradle ==="
cat > android/variables.gradle << 'VAREOF'
ext {
    minSdkVersion = 24
    compileSdkVersion = 34
    targetSdkVersion = 34
    androidxActivityVersion = '1.8.2'
    androidxAppCompatVersion = '1.6.1'
    androidxCoordinatorLayoutVersion = '1.2.0'
    androidxCoreVersion = '1.12.0'
    androidxFragmentVersion = '1.6.2'
    coreSplashScreenVersion = '1.0.1'
    androidxWebkitVersion = '1.10.0'
    junitVersion = '4.13.2'
    androidxJunitVersion = '1.1.5'
    androidxEspressoCoreVersion = '3.5.1'
    cordovaAndroidVersion = '10.1.1'
}
VAREOF

echo "=== All config files fixed! ==="
