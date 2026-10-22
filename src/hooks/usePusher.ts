import { useEffect, useState } from "react";
import Pusher from "pusher-js";

export function usePusher(channelName: string, events: string[]) {
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    // Initialize Pusher
    const pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channelInstance = pusherInstance.subscribe(channelName);

    setPusher(pusherInstance);
    setChannel(channelInstance);

    return () => {
      channelInstance.unsubscribe();
      pusherInstance.disconnect();
    };
  }, [channelName]);

  const bind = (eventName: string, callback: (data: any) => void) => {
    if (channel) {
      channel.bind(eventName, callback);
    }
  };

  const unbind = (eventName: string, callback: (data: any) => void) => {
    if (channel) {
      channel.unbind(eventName, callback);
    }
  };

  return { pusher, channel, bind, unbind };
}
