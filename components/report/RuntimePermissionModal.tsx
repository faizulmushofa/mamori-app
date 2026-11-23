import React from 'react';
import { View, Text, Modal, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, radii, typography, shadows } from '../../lib/tokens';

interface RuntimePermissionModalProps {
  visible: boolean;
  type: 'camera' | 'location' | 'storage';
  onAllow: () => void;
  onDeny: () => void;
}

/**
 * Dialog Permintaan Izin Runtime Just-In-Time (JIT) (PRD F-92)
 */
export const RuntimePermissionModal: React.FC<RuntimePermissionModalProps> = ({
  visible,
  type,
  onAllow,
  onDeny,
}) => {
  const content = {
    camera: {
      icon: '📷',
      title: 'Izin Akses Kamera Diperlukan',
      desc: 'MAMORI hanya menerima bukti foto langsung dari kamera (bukan galeri) untuk menjamin keaslian masalah di lapangan (PRD F-01). Wajah & plat nomor akan diblur otomatis.',
      btnText: 'Izinkan Akses Kamera',
    },
    location: {
      icon: '📍',
      title: 'Izin Akses Lokasi GPS Diperlukan',
      desc: 'Koordinat lokasi diperlukan untuk menanam watermark pada foto laporan dan menghitung radius duplikat 25m (PRD F-02, F-11). Data lokasi Anda dilindungi UU PDP.',
      btnText: 'Izinkan Akses Lokasi',
    },
    storage: {
      icon: '📁',
      title: 'Izin Scoped Storage (Document Vault)',
      desc: 'Foto draf laporan disimpan di direktori terisolasi aplikasi (documentDirectory) agar Anda tetap bisa melapor saat tidak ada sinyal (PRD F-06, F-90).',
      btnText: 'Izinkan Scoped Storage',
    },
  }[type];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDeny}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>{content.icon}</Text>
          </View>

          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.desc}>{content.desc}</Text>

          <View style={styles.securityBadge}>
            <Text style={styles.securityText}>
              🔒 Amanah: Data Anda tidak dibagikan ke pihak ketiga
            </Text>
          </View>

          <View style={styles.btnGroup}>
            <Pressable
              style={({ pressed }) => [
                styles.allowBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={onAllow}
            >
              <Text style={styles.allowBtnText}>{content.btnText}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.denyBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={onDeny}
            >
              <Text style={styles.denyBtnText}>Nanti Saja</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: '100%',
    alignItems: 'center',
    ...shadows.lg,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
    textAlign: 'center',
  },
  desc: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  securityBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  securityText: {
    fontSize: typography.size.xs,
    color: colors.success,
    fontWeight: typography.weight.semibold,
  },
  btnGroup: {
    width: '100%',
    gap: spacing.sm,
  },
  allowBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  allowBtnText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  denyBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  denyBtnText: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
  },
  btnPressed: {
    opacity: 0.8,
  },
});
