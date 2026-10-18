package com.alafasyquran

import android.net.Uri
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.ViewManager
import com.facebook.react.ReactPackage
import java.io.File
import java.io.FileOutputStream
import java.io.IOException

class QuranAudioAssetsModule(
  private val appContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(appContext) {
  override fun getName() = "QuranAudioAssets"

  @ReactMethod
  fun copySurahToCache(surahNumber: Int, promise: Promise) {
    if (surahNumber !in 1..114) {
      promise.reject(
        "invalid_surah_number",
        "Surah number must be between 1 and 114.",
      )
      return
    }

    val assetName = "alafasy_surah_%03d.mp3".format(surahNumber)
    val file = File(appContext.cacheDir, "current-surah.mp3")
    val temporaryFile = File(appContext.cacheDir, "current-surah.tmp")

    try {
      val resourceId = if (BuildConfig.DEBUG) {
        val resourceId = appContext.resources.getIdentifier(
          assetName.substringBeforeLast("."),
          "raw",
          appContext.packageName,
        )
        resourceId
      } else {
        0
      }
      val input = if (resourceId != 0) {
        appContext.resources.openRawResource(resourceId)
      } else {
        appContext.assets.open("audio/$assetName")
      }

      input.use { source ->
        FileOutputStream(temporaryFile).use { destination ->
          source.copyTo(destination)
        }
      }

      if (file.exists() && !file.delete()) {
        throw IOException("Could not replace the cached surah audio.")
      }
      if (!temporaryFile.renameTo(file)) {
        throw IOException("Could not move the new surah audio into cache.")
      }

      promise.resolve(Uri.fromFile(file).toString())
    } catch (exception: Exception) {
      temporaryFile.delete()
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
