import React from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { parseVideo } from "../utils/videoUtils";
import { useWistia } from "../hooks/useWistia";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "wistia-player": any;
    }
  }
}

interface Props {
  videoUrl: string;
  title?: string;
}

export default function VideoPlayer({
  videoUrl
}: Props) {

  const ready = useWistia();

  const video = parseVideo(videoUrl);

  if (!videoUrl) {

    return (

      <div className="aspect-video bg-slate-100 flex items-center justify-center">

        Nenhum vídeo.

      </div>

    );

  }

  if (video.provider !== "wistia") {

    return (

      <div className="aspect-video bg-red-50 flex items-center justify-center">

        <div className="text-center">

          <AlertCircle className="mx-auto mb-2" />

          Formato ainda não suportado.

        </div>

      </div>

    );

  }

  if (!ready) {

    return (

      <div className="aspect-video bg-slate-900 flex flex-col items-center justify-center text-white">

        <Loader2 className="animate-spin h-8 w-8 mb-3"/>

        A carregar vídeo...

      </div>

    );

  }

  return (

    <div className="aspect-video">

      <wistia-player

        key={video.id}

        media-id={video.id}

        aspect="1.7777777777777777"

        style={{
          width:"100%",
          height:"100%"
        }}

      ></wistia-player>

    </div>


  );

}