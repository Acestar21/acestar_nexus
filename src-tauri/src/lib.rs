use tauri::Manager;
use tauri_plugin_shell::ShellExt;
use std::sync::atomic::{AtomicBool, Ordering};

static BACKEND_STARTED: AtomicBool = AtomicBool::new(false);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            if BACKEND_STARTED.compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst).is_ok() {
                let sidecar = app
                    .shell()
                    .sidecar("acestar-backend")
                    .expect("failed to create backend sidecar");

                let (_, child) = sidecar
                    .spawn()
                    .expect("failed to launch backend");

                app.manage(std::sync::Mutex::new(Some(child)));
            }

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            match event {
                tauri::WindowEvent::CloseRequested { .. } | tauri::WindowEvent::Destroyed => {
                    let state = window.app_handle()
                        .try_state::<std::sync::Mutex<Option<tauri_plugin_shell::process::CommandChild>>>();
                    if let Some(state) = state {
                        if let Ok(mut child) = state.lock() {
                            if let Some(c) = child.take() {
                                let _ = c.kill();
                            }
                        }
                    }
                    std::process::exit(0);
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}