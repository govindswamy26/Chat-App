const Skeleton = ({ className = "" }) => <div className={`rounded-xl shimmer ${className}`} aria-hidden />;

export const MessageListSkeleton = () => (
    <div className="space-y-6 p-6" aria-busy="true" aria-label="Loading messages">
        {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`flex ${i % 2 ? "justify-end" : "justify-start"}`}>
                <Skeleton className={`h-12 ${i % 2 ? "w-[55%]" : "w-[48%]"}`} />
            </div>
        ))}
    </div>
);

export const SidebarListSkeleton = () => (
    <div className="space-y-2 mt-4" aria-busy="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="w-11 h-11 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-2 w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

export default Skeleton;
