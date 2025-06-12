import LoaderBar from "@/components/ui/loader-bar";

export default function Loading() {
    // {/* A loader Bar for the whole app */} 
    // You can add any UI inside Loading, including a Skeleton.
    return <LoaderBar className="fixed top-0 left-0 w-screen z-[1000] bg-blue-500" />;
}