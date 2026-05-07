import { useEffect, useState } from 'react';
import { EventsOn } from '../../../wailsjs/runtime/runtime';
import type { NetworkSpeedSample, SpeedState } from './types';

const SPEED_UPDATE_EVENT = 'network:speed.updated';
const SPEED_ERROR_EVENT = 'network:speed.error';

interface NetworkSpeedErrorPayload {
  message?: string;
}

export function useNetworkSpeed() {
  const [state, setState] = useState<SpeedState>({
    sample: null,
    errorMessage: null,
  });

  useEffect(() => {
    const unsubscribeUpdate = EventsOn(SPEED_UPDATE_EVENT, (payload: NetworkSpeedSample) => {
      setState({
        sample: payload,
        errorMessage: null,
      });
    });

    const unsubscribeError = EventsOn(SPEED_ERROR_EVENT, (payload: NetworkSpeedErrorPayload) => {
      setState((current) => ({
        ...current,
        errorMessage: payload?.message ?? 'Unable to read network activity.',
      }));
    });

    return () => {
      unsubscribeUpdate();
      unsubscribeError();
    };
  }, []);

  return state;
}
