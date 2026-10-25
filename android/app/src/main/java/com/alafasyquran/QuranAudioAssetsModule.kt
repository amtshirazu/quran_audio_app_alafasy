package com.alafasyquran

import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.ViewManager
import com.facebook.react.ReactPackage

class QuranAudioAssetsModule(
  private val appContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(appContext) {
  override fun getName() = "QuranAudioAssets"

  @ReactMethod
  fun getSurahAssetUri(surahNumber: Int, promise: Promise) {
    if (surahNumber !in 1..114) {
      promise.reject(
        "invalid_surah_number",
        "Surah number must be between 1 and 114.",
      )
      return
    }

    val assetName = "alafasy_surah_%03d.mp3".format(surahNumber)
    val assetPath = "audio/$assetName"

    try {
      // Validate that the install-time asset is accessible before handing its
      // APK asset URI to TrackPlayer.
      appContext.assets.open(assetPath).use { }
      promise.resolve("file:///android_asset/$assetPath")
    } catch (exception: Exception) {
      promise.reject(
        "quran_audio_asset_unavailable",
        "Could not read the install-time audio asset for surah $surahNumber.",
        exception,
      )
    }
  }
}

class QuranAudioAssetsPackage : ReactPackage {
  override fun createNativeModules(
    reactContext: ReactApplicationContext,
  ): List<NativeModule> = listOf(QuranAudioAssetsModule(reactContext))

  override fun createViewManagers(
    reactContext: ReactApplicationContext,
  ): List<ViewManager<*, *>> = emptyList()
}
