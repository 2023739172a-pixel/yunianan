#!/bin/bash
echo "=== Fixing gradle-wrapper.properties ==="
cat > android/gradle/wrapper/gradle-wrapper.properties << 'PROPEOF'
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.5-all.zip
networkTimeout=120000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
PROPEOF
cat android/gradle/wrapper/gradle-wrapper.properties

echo "=== Fixing root build.gradle ==="
cat > android/build.gradle << 'BUILDEOF'
// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
    
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
        classpath 'com.google.gms:google-services:4.4.0'

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
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

echo "=== Fixing gradle.properties ==="
cat > android/gradle.properties << 'PROPS'
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
PROPS

echo "=== Fixing app/build.gradle ==="
cat > android/app/build.gradle << 'APPEOF'
apply plugin: 'com.android.application'

android {
    namespace = "com.ai.answer"
    compileSdk = rootProject.ext.compileSdkVersion

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_21
        targetCompatibility JavaVersion.VERSION_21
    }

    defaultConfig {
        applicationId "com.ai.answer"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        aaptOptions {
            ignoreAssetsPattern = '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~'
        }
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

repositories {
    flatDir{
        dirs '../capacitor-cordova-android-plugins/src/main/libs', 'libs'
    }
}

dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    implementation project(':capacitor-android')
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
    implementation project(':capacitor-cordova-android-plugins')
}

apply from: 'capacitor.build.gradle'

try {
    def servicesJSON = file('google-services.json')
    if (servicesJSON.text) {
        apply plugin: 'com.google.gms.google-services'
    }
} catch(Exception e) {
    logger.info("google-services.json not found, google-services plugin not applied. Push Notifications won't work")
}
APPEOF

echo "=== All config files fixed! ==="
