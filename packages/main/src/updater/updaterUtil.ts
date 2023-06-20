// if baseUrl path doesn't ends with /, this path will be not prepended to passed pathname for new URL(input, base)
import {URL} from 'node:url';
import escapeRegExp from 'lodash.escaperegexp';
import type {WindowsUpdateInfo} from 'builder-util-runtime';
import {newError, safeStringifyJson} from 'builder-util-runtime';
import type {ResolvedUpdateFileInfo, UpdateFileInfo, UpdateInfo} from 'electron-updater';
import {load} from 'js-yaml';

export function newBaseUrl(url: string): URL {
  const result = new URL(url);
  if (!result.pathname.endsWith('/')) {
    result.pathname += '/';
  }
  return result;
}

// addRandomQueryToAvoidCaching is false by default because in most cases URL already contains version number,
// so, it makes sense only for Generic Provider for channel files
export function newUrlFromBase(
  pathname: string,
  baseUrl: URL,
  addRandomQueryToAvoidCaching = false,
): URL {
  const result = new URL(pathname, baseUrl);
  // search is not propagated (search is an empty string if not specified)
  const search = baseUrl.search;
  if (search != null && search.length !== 0) {
    result.search = search;
  } else if (addRandomQueryToAvoidCaching) {
    result.search = `noCache=${Date.now().toString(32)}`;
  }
  return result;
}

export function getChannelFilename(channel: string): string {
  return `${channel}.yml`;
}

export function blockmapFiles(baseUrl: URL, oldVersion: string, newVersion: string): URL[] {
  const newBlockMapUrl = newUrlFromBase(`${baseUrl.pathname}.blockmap`, baseUrl);
  const oldBlockMapUrl = newUrlFromBase(
    `${baseUrl.pathname.replace(new RegExp(escapeRegExp(newVersion), 'g'), oldVersion)}.blockmap`,
    baseUrl,
  );
  return [oldBlockMapUrl, newBlockMapUrl];
}

interface UpdateInfoWithSha2 extends UpdateInfo {
  readonly sha2?: string;
}

export function getFileList(updateInfo: UpdateInfo): Array<UpdateFileInfo> {
  const files = updateInfo.files;
  if (files != null && files.length > 0) {
    return files;
  }

  if (updateInfo.path != null) {
    return [
      {
        url: updateInfo.path,
        sha2: (updateInfo as UpdateInfoWithSha2).sha2,
        sha512: updateInfo.sha512,
      } as UpdateFileInfo,
    ];
  } else {
    throw newError(
      `No files provided: ${safeStringifyJson(updateInfo)}`,
      'ERR_UPDATER_NO_FILES_PROVIDED',
    );
  }
}

export function resolveFiles(
  updateInfo: UpdateInfo,
  baseUrl: URL,
  pathTransformer: (p: string) => string = (p: string): string => p,
): Array<ResolvedUpdateFileInfo> {
  const files = getFileList(updateInfo);
  const result: Array<ResolvedUpdateFileInfo> = files.map(fileInfo => {
    if ((fileInfo as any).sha2 == null && fileInfo.sha512 == null) {
      throw newError(
        `Update info doesn't contain nor sha256 neither sha512 checksum: ${safeStringifyJson(
          fileInfo,
        )}`,
        'ERR_UPDATER_NO_CHECKSUM',
      );
    }
    return {
      url: newUrlFromBase(pathTransformer(fileInfo.url), baseUrl),
      info: fileInfo,
    };
  });

  const packages = (updateInfo as WindowsUpdateInfo).packages;
  const packageInfo = packages == null ? null : packages[process.arch] || packages.ia32;
  if (packageInfo != null) {
    (result[0] as any).packageInfo = {
      ...packageInfo,
      path: newUrlFromBase(pathTransformer(packageInfo.path), baseUrl).href,
    };
  }
  return result;
}

export function parseUpdateInfo(
  rawData: string | null,
  channelFile: string,
  channelFileUrl: URL,
): UpdateInfo {
  if (rawData == null) {
    throw newError(
      `Cannot parse update info from ${channelFile} in the latest release artifacts (${channelFileUrl}): rawData: null`,
      'ERR_UPDATER_INVALID_UPDATE_INFO',
    );
  }

  let result: UpdateInfo;
  try {
    result = load(rawData) as UpdateInfo;
  } catch (e: any) {
    throw newError(
      `Cannot parse update info from ${channelFile} in the latest release artifacts (${channelFileUrl}): ${
        e.stack || e.message
      }, rawData: ${rawData}`,
      'ERR_UPDATER_INVALID_UPDATE_INFO',
    );
  }
  return result;
}
