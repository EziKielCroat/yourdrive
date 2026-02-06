import prisma from "../lib/prisma";

import { BigIntHelper } from "../lib/bigint-helper";

export class StorageService {
  static async getStorageInfo(userId: string) {
  // Get current device storage limit (include id so we can update if needed)
  const currentDevice = await prisma.userDevice.findFirst({
    where: {
      userId,
      isCurrent: true,
    },
    select: {
      id: true,
      storageLimit: true,
      deviceName: true,
    },
  });

  // Get user email to check if it's a skole.hr user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, emailVerified: true },
  });

  // Calculate used storage
  const usedStorage = await prisma.userFile.aggregate({
    where: {
      userId,
      deletedAt: null,
    },
    _sum: {
      size: true,
    },
  });

  const isSkoleUser = user?.email?.toLowerCase().endsWith("@skole.hr") ?? false;
  const hasEducationalBonus = isSkoleUser && (user?.emailVerified === true);
  const educationalLimitBytes = BigIntHelper.gbToBytes(100); // 50GB base + 50GB bonus

  let limit = BigIntHelper.toBigInt(currentDevice?.storageLimit ?? null) || BigIntHelper.gbToBytes(50);

  // If user has educational plan (verified @skole.hr) but current device shows base 50GB or no limit, use 100GB and persist
  if (hasEducationalBonus && limit < educationalLimitBytes) {
    limit = educationalLimitBytes;
    if (currentDevice?.id) {
      await prisma.userDevice.update({
        where: { id: currentDevice.id },
        data: { storageLimit: limit },
      }).catch(() => { /* ignore update errors */ });
    }
  }

  const used = BigIntHelper.toBigInt(usedStorage._sum.size);
  const available = BigIntHelper.subtract(limit, used);
  const usagePercentage = BigIntHelper.calculatePercentage(used, limit);
  const tier = this.getStorageTier(limit, hasEducationalBonus);

  return {
    limit: limit.toString(),
    used: used.toString(),
    available: available.toString(),
    usagePercentage,
    tier,
    deviceName: currentDevice?.deviceName || "Primary Device",
    isEducational: hasEducationalBonus,
    hasBonus: hasEducationalBonus,
    educationalBonus: hasEducationalBonus ? "50GB" : "0GB",
  };
}

  static async getUserSettings(userId: string) {
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
      select: {
        storage: true,
      },
    });

    const storageInfo = await this.getStorageInfo(userId);

    return {
      storage: {
        ...(settings?.storage as any),
        totalStorage: storageInfo.limit,
        usedStorage: storageInfo.used,
        availableStorage: storageInfo.available,
        usagePercentage: storageInfo.usagePercentage,
        tier: storageInfo.tier,
        isEducational: storageInfo.isEducational,
      },
    };
  }

  static async updateStorageSettings(userId: string, data: any) {
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  // Parse current storage settings
  const currentStorage = settings?.storage 
    ? (typeof settings.storage === 'object' 
        ? settings.storage 
        : JSON.parse(settings.storage as string))
    : {};

  const updatedStorage = {
    ...currentStorage,
    ...data,
  };

  await prisma.userSettings.upsert({
    where: { userId },
    update: {
      storage: updatedStorage,
    },
    create: {
      userId,
      storage: updatedStorage,
    },
  });

  return { success: true };
}

  static async getStorageStats(userId: string) {
  // Get file counts by type
  const fileTypes = await prisma.userFile.groupBy({
    by: ['mimeType'],
    where: {
      userId,
      deletedAt: null,
      isFolder: false,
    },
    _sum: {
      size: true,
    },
    _count: {
      id: true,
    },
  });

  // Get largest files
  const largestFiles = await prisma.userFile.findMany({
    where: {
      userId,
      deletedAt: null,
      isFolder: false,
    },
    orderBy: {
      size: 'desc',
    },
    take: 5,
    select: {
      originalName: true,
      size: true,
      mimeType: true,
      createdAt: true,
    },
  });

  const totalInfo = await this.getStorageInfo(userId);

  return {
    total: totalInfo,
    byType: fileTypes.map(type => ({
      mimeType: type.mimeType,
      size: BigIntHelper.toBigInt(type._sum.size).toString(),
      count: type._count.id,
    })),
    largestFiles: largestFiles.map(file => ({
      name: file.originalName,
      size: BigIntHelper.toBigInt(file.size).toString(),
      type: file.mimeType,
      uploaded: file.createdAt,
    })),
  };
}

  private static getStorageTier(limit: bigint, hasEducationalBonus: boolean = false): string {
  const inGB = Number(limit) / (1024 * 1024 * 1024);
  
  // Check for educational tier (100GB for verified skole.hr users)
  if (hasEducationalBonus && inGB >= 100) {
    return "100GB Educational Plan (50GB + 50GB School Bonus)";
  }
  
  // Standard tiers
  if (inGB >= 150) return "150GB (Pro Plan)";
  if (inGB >= 100) return "100GB (Plus Plan)";
  if (inGB >= 50) return "50GB (Free Plan)";
  
  return `${Math.round(inGB)}GB`;
}

  static async clearCache(userId: string): Promise<void> {
  // Mark cache files as deleted
  const cacheFiles = await prisma.userFile.findMany({
    where: {
      userId,
      folderPath: { startsWith: ".cache/" },
      deletedAt: null,
    },
  });

  for (const file of cacheFiles) {
    await prisma.userFile.update({
      where: { id: file.id },
      data: { deletedAt: new Date() },
    });
  }

  console.log(`Cleared ${cacheFiles.length} cache files for user ${userId}`);
}

  static async removeDuplicates(userId: string): Promise<number> {
    // Find duplicate files based on fileHash
    const duplicates = await prisma.userFile.groupBy({
      by: ['fileHash'],
      where: {
        userId,
        deletedAt: null,
        fileHash: { not: null },
        isFolder: false,
      },
      having: {
        fileHash: {
          _count: {
            gt: 1,
          },
        },
      },
      _count: {
        id: true,
      },
    });

    let removedCount = 0;

    for (const duplicate of duplicates) {
      if (!duplicate.fileHash) continue;

      // Get all files with this hash
      const files = await prisma.userFile.findMany({
        where: {
          userId,
          fileHash: duplicate.fileHash,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'asc', // Keep the oldest file
        },
      });

      // Mark duplicates (all except the first one) as deleted
      for (let i = 1; i < files.length; i++) {
        await prisma.userFile.update({
          where: { id: files[i].id },
          data: { deletedAt: new Date() },
        });
        removedCount++;
      }
    }

    return removedCount;
  }
}