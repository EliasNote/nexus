#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    use std::path::Path;

    let fixed_webview2 =
        r"C:\WebView2Fixed\Microsoft.WebView2.FixedVersionRuntime.150.0.4078.48.x64";

    if std::env::var_os("WEBVIEW2_BROWSER_EXECUTABLE_FOLDER").is_none()
        && Path::new(fixed_webview2)
            .join("msedgewebview2.exe")
            .exists()
    {
        std::env::set_var("WEBVIEW2_BROWSER_EXECUTABLE_FOLDER", fixed_webview2);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
