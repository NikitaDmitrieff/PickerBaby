import React, { useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Canvas, Circle, Shadow, Group } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';

type Finger = { id: number; x: number; y: number };

export default function Screen() {
  const { width, height } = useWindowDimensions();
  const fingersRef = useRef<Map<number, Finger>>(new Map());
  const [, force] = useState(0);
  const [locked, setLocked] = useState<Finger[] | null>(null);
  const [winnerId, setWinnerId] = useState<number | null>(null);

  const rerender = () => force((n) => n + 1);

  const viewProps = {
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder: () => true,
    onResponderGrant: (e: any) => {
      for (const t of e.nativeEvent.touches) {
        fingersRef.current.set(t.identifier, { id: t.identifier, x: t.locationX, y: t.locationY });
      }
      rerender();
    },
    onResponderMove: (e: any) => {
      for (const t of e.nativeEvent.touches) {
        const f = fingersRef.current.get(t.identifier);
        if (f) {
          f.x = t.locationX;
          f.y = t.locationY;
        }
      }
      rerender();
    },
    onResponderRelease: (e: any) => {
      for (const t of e.nativeEvent.changedTouches) {
        fingersRef.current.delete(t.identifier);
      }
      rerender();
    },
    onResponderTerminate: () => {
      fingersRef.current.clear();
      rerender();
    },
  } as const;

  const fingers = useMemo(() => Array.from(fingersRef.current.values()), [locked, winnerId]);

  function pickWinner() {
    const snapshot = Array.from(fingersRef.current.values());
    setLocked(snapshot);

    if (snapshot.length < 2) {
      setWinnerId(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const br = { x: width, y: height };
    const dist = (p: Finger) => Math.hypot(br.x - p.x, br.y - p.y);
    let bottomRight = snapshot[0];
    for (const f of snapshot) if (dist(f) < dist(bottomRight)) bottomRight = f;

    const candidates = snapshot.filter((f) => f.id !== bottomRight.id);
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    setWinnerId(pick.id);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  function reset() {
    setLocked(null);
    setWinnerId(null);
  }

  const renderSet = locked ?? fingers;

  return (
    <View className="flex-1 bg-black" {...viewProps}>
      <Canvas style={{ position: 'absolute', inset: 0 }}>
        {renderSet.map((f) => {
          const isWinner = f.id === winnerId;
          const r = isWinner ? 44 : 36;
          return (
            <Group key={f.id} transform={[{ translateX: f.x }, { translateY: f.y }]}>
              <Circle cx={0} cy={0} r={r + 10} opacity={0.12} />
              <Shadow dx={0} dy={0} blur={24} />
              <Circle cx={0} cy={0} r={r} style="stroke" strokeWidth={isWinner ? 6 : 4} />
              <Circle cx={0} cy={0} r={10} />
            </Group>
          );
        })}
      </Canvas>

      <View className="absolute bottom-8 left-0 right-0 items-center gap-3">
        <View className="flex-row gap-3">
          <Pressable onPress={pickWinner} disabled={!!locked} className="px-6 py-3 rounded-2xl bg-white/90">
            <Text className="text-black font-semibold">Pick</Text>
          </Pressable>
          <Pressable onPress={reset} className="px-6 py-3 rounded-2xl bg-white/20">
            <Text className="text-white font-semibold">Reset</Text>
          </Pressable>
        </View>

        {!!locked && (
          <Text className="text-white/80 mt-1">
            Bottom-right finger was excluded • {winnerId == null ? 'Need 2+ fingers' : 'Winner chosen'}
          </Text>
        )}
      </View>
    </View>
  );
}


