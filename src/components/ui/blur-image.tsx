"use client";

import { placeholderBlurhash } from "@/lib/utils";
import cn from "clsx";
import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import type { ComponentProps } from "react";

export default function BlurImage(props: ComponentProps<typeof Image>) {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isError, setIsError] = useState(false);

    const imageSrc = props.src as string;
    // const imageName = imageSrc.split('/').pop()?.split('?')[0] || 'IMG';
    // const imageType = imageSrc.split('.').pop()?.toUpperCase() || 'IMG';
    // DATA:IMAGE/PNG;BASE64,IVBORW0KGGOAAAANSUHEUGAAADAAAAAWCAY

    const isDataUrl = imageSrc.startsWith("data:");
    const imageType = isDataUrl
        ? imageSrc.split(";")[0].split(":")[1].split("/")[1].toUpperCase()
        : imageSrc.includes("?") ? imageSrc.split('/').pop()?.split('?')[0] || 'IMG'
        : imageSrc.split('.').pop()?.toUpperCase() || 'IMG';

    return (
        <div className="relative flex flex-col items-center justify-center h-full overflow-hidden">
            <div className={cn(
                "absolute inset-0 bg-muted/30 backdrop-blur-[2px] rounded-lg",
                !isLoading && "hidden"
            )}>
                <div className="flex flex-col items-center justify-center h-full gap-y-2 text-muted-foreground animate-pulse">
                    <ImageOff className="h-6 w-6" />
                    <span className="text-xs font-medium">
                        {imageType}
                    </span>
                </div>
            </div>

            <Image
                {...props}
                alt={props.alt}
                className={cn(
                    props.className,
                    "duration-700 ease-in-out",
                    isLoading ? "scale-105 blur-lg" : "scale-100 blur-0",
                )}
                onLoad={() => {
                    setIsLoading(false);
                    setIsLoaded(true);
                    setIsError(false);
                }}
                onLoadingComplete={() => {
                    setIsLoading(false);
                    setIsLoaded(true);
                    setIsError(false);
                }}
                onError={() => setIsError(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                blurDataURL={props.blurDataURL || props.src as string || placeholderBlurhash}
                placeholder="blur"
            />
            
            {isError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-y-2 bg-muted/50 backdrop-blur-[2px] rounded-lg text-muted-foreground animate-pulse">
                    <ImageOff className="h-6 w-6" />
                    <span className="text-xs font-medium">
                        {imageType}
                    </span>
                </div>
            )}
        </div>
    );
}