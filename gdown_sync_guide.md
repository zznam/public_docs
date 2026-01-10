# Syncing Google Drive Folders with `gdown` and Cron

This document outlines the process of syncing a public Google Drive folder to a local directory using `gdown`, including strategies to avoid rate limits and automate the process using Cron jobs.

## Prerequisites

- **gdown**: A Python-based CLI tool for downloading files/folders from Google Drive.
  ```bash
  pip install gdown
  ```

## Core Sync Command

To download a folder while only fetching new or missing files, use the `--continue` (or `-c`) flag. This prevents re-downloading existing data and helps stay within Google Drive's access quotas.

```bash
gdown "https://drive.google.com/drive/folders/YOUR_FOLDER_ID" --folder -O /path/to/local_folder --continue --remaining-ok
```

### Flag Breakdown:
- `--folder`: Indicates the URL is a Drive folder.
- `-O`: Specifies the output directory.
- `--continue` (or `-c`): **Crucial!** Skips files that already exist locally or resumes partial downloads.
- `--remaining-ok`: Required by `gdown` for folders with more than 50 files to acknowledge potential batching limits.

---

## Handling Rate Limits

Google Drive often imposes rate limits if a folder is accessed too frequently or if too many files are requested at once. 

### Strategies:
1.  **Back-off and Retry**: If you see "Cannot retrieve the public link," wait at least 15–30 minutes before retrying. 
2.  **Scheduled Intervals**: Do not run the sync task every minute. Hourly or daily syncs are recommended.
3.  **Random Jitter**: Add a small random delay to your cron job to avoid hitting the API at the exact same second as other automated tasks.

---

## Automating with Cron Jobs

You can automate the sync process using the system's `crontab`.

### 1. Identify paths
Always use absolute paths in cron jobs for both the `gdown` binary and the target directory.
- Find `gdown` path: `which gdown` (e.g., `/usr/local/bin/gdown`)
- Find local path: `/absolute/path/to/local_folder`

### 2. Configure the Crontab
Open your crontab editor:
```bash
crontab -e
```

### 3. Add the scheduled task
Add a line to run the sync. 

**Example: Run every hour at minute 0**
```cron
0 * * * * /usr/local/bin/gdown "https://drive.google.com/drive/folders/YOUR_FOLDER_ID" --folder -O /absolute/path/to/local_folder --continue --remaining-ok >> /absolute/path/to/sync.log 2>&1
```

**Example: Run at 2 AM every day (Best for avoiding daytime rate limits)**
```cron
0 2 * * * /usr/local/bin/gdown "https://drive.google.com/drive/folders/YOUR_FOLDER_ID" --folder -O /absolute/path/to/local_folder --continue --remaining-ok
```

### 4. Adding "Jitter" (Recommended)
To avoid predictable API traffic, sleep for a random amount of time (up to 5 minutes) before the command:
```cron
0 * * * * sleep $((RANDOM % 300)) && /usr/local/bin/gdown ...
```

## Troubleshooting
- **Error: "Too many accesses"**: Google has temporary blocked your IP/account for this file. Wait and use the `--continue` flag later.
- **Log Files**: Always redirect output to a log file (`>> /path/to/log 2>&1`) to debug why a cron job might have failed.
