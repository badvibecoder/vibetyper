// vibetyper rust dictionary data — filesystem helpers
export const blocks = [
  String.raw`// Reads a text file into its individual lines.
fn read_lines(path: &std::path::Path) -> std::io::Result<Vec<String>> {
    let contents = std::fs::read_to_string(path)?;
    Ok(contents.lines().map(|line| line.to_string()).collect())
}`,

  String.raw`fn write_lines(path: &std::path::Path, lines: &[String]) -> std::io::Result<()> {
    let mut joined = lines.join("\n");
    joined.push('\n');
    std::fs::write(path, joined)
}`,

  String.raw`fn file_size_bytes(path: &std::path::Path) -> std::io::Result<u64> {
    let meta = std::fs::metadata(path)?;
    if meta.is_dir() {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "expected a regular file",
        ));
    }
    Ok(meta.len())
}`,

  String.raw`fn is_directory_path(path: &std::path::Path) -> std::io::Result<bool> {
    match std::fs::metadata(path) {
        Ok(meta) => Ok(meta.is_dir()),
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => Ok(false),
        Err(err) => Err(err),
    }
}`,

  String.raw`fn list_dir_names(dir: &std::path::Path) -> std::io::Result<Vec<String>> {
    let mut names = Vec::new();
    for entry in std::fs::read_dir(dir)? {
        let name = entry?.file_name();
        names.push(name.to_string_lossy().into_owned());
    }
    Ok(names)
}`,

  String.raw`fn count_files_in_dir(dir: &std::path::Path) -> std::io::Result<usize> {
    let mut total = 0;
    for entry in std::fs::read_dir(dir)? {
        if entry?.file_type()?.is_file() {
            total += 1;
        }
    }
    Ok(total)
}`,

  String.raw`fn append_line(path: &std::path::Path, line: &str) -> std::io::Result<()> {
    use std::io::Write;
    let mut file = std::fs::OpenOptions::new()
        .append(true)
        .create(true)
        .open(path)?;
    file.write_all(line.as_bytes())?;
    file.write_all(b"\n")
}`,

  String.raw`fn file_extension(path: &std::path::Path) -> Option<String> {
    match path.extension() {
        Some(ext) => {
            let lower = ext.to_string_lossy().to_lowercase();
            if lower.is_empty() {
                None
            } else {
                Some(lower)
            }
        }
        None => None,
    }
}`,

  String.raw`// Returns the final component of a path, or None for the root.
fn base_name(path: &std::path::Path) -> Option<String> {
    path.file_name().map(|name| name.to_string_lossy().into_owned())
}`,

  String.raw`fn join_paths(base: &std::path::Path, components: &[&str]) -> std::path::PathBuf {
    let mut joined = base.to_path_buf();
    for component in components {
        joined.push(component);
    }
    joined
}`,

  String.raw`fn ensure_dir(dir: &std::path::Path) -> std::io::Result<()> {
    if dir.exists() {
        return Ok(());
    }
    std::fs::create_dir_all(dir)
}`,

  String.raw`fn copy_file_if_exists(src: &std::path::Path, dst: &std::path::Path) -> std::io::Result<u64> {
    match std::fs::copy(src, dst) {
        Ok(copied) => Ok(copied),
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => Ok(0),
        Err(err) => Err(err),
    }
}`,

  String.raw`fn remove_file_if_exists(path: &std::path::Path) -> std::io::Result<()> {
    match std::fs::remove_file(path) {
        Ok(()) => Ok(()),
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(err) => Err(err),
    }
}`,

  String.raw`// The name without its final extension, e.g. "archive.tar.gz" -> "archive.tar".
fn file_stem(path: &std::path::Path) -> Option<String> {
    path.file_stem().map(|stem| stem.to_string_lossy().into_owned())
}`,

  String.raw`fn read_first_n_bytes(path: &std::path::Path, limit: u64) -> std::io::Result<Vec<u8>> {
    use std::io::Read;
    let file = std::fs::File::open(path)?;
    let mut bytes = Vec::with_capacity(limit as usize);
    file.take(limit).read_to_end(&mut bytes)?;
    Ok(bytes)
}`,

  String.raw`fn touch_file(path: &std::path::Path) -> std::io::Result<()> {
    let file = std::fs::OpenOptions::new()
        .write(true)
        .create(true)
        .open(path)?;
    drop(file);
    Ok(())
}`,

  String.raw`fn last_modified_epoch(path: &std::path::Path) -> std::io::Result<u64> {
    let meta = std::fs::metadata(path)?;
    let modified = meta.modified()?;
    let since_epoch = modified
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|err| std::io::Error::new(std::io::ErrorKind::InvalidData, err))?;
    Ok(since_epoch.as_secs())
}`,

  String.raw`fn is_hidden_path(path: &std::path::Path) -> bool {
    path.file_name()
        .and_then(|name| name.to_str())
        .map(|name| name.starts_with('.'))
        .unwrap_or(false)
}`,

  String.raw`fn normalize_slashes(path: &str) -> String {
    let mut normalized = path.replace('\\', "/");
    while normalized.contains("//") {
        normalized = normalized.replace("//", "/");
    }
    normalized.trim_end_matches('/').to_string()
}`,

  String.raw`fn sorted_file_names(dir: &std::path::Path) -> std::io::Result<Vec<String>> {
    let mut names: Vec<String> = std::fs::read_dir(dir)?
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.file_name().to_string_lossy().into_owned())
        .collect();
    names.sort();
    Ok(names)
}`,

  String.raw`fn split_path_components(path: &std::path::Path) -> Vec<String> {
    path.components()
        .filter_map(|part| match part {
            std::path::Component::Normal(name) => Some(name.to_string_lossy().into_owned()),
            std::path::Component::RootDir => Some(String::from("/")),
            _ => None,
        })
        .collect()
}`,

  String.raw`fn is_absolute_path(path: &std::path::Path) -> bool {
    if path.is_absolute() {
        return true;
    }
    let text = path.to_string_lossy();
    text.starts_with('/') || text.starts_with("\\\\")
}`,
];
// total: 22
