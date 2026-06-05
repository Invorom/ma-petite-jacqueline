export default function ShopLoading() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 animate-pulse gap-4">
                <div className="h-10 bg-brand-secondary/10 rounded-full w-48"></div>
                <div className="h-12 bg-brand-secondary/10 rounded-xl w-full md:w-64"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-col animate-pulse">
                        <div className="aspect-[4/5] bg-brand-secondary/10 rounded-2xl mb-4 w-full"></div>
                        <div className="h-6 bg-brand-secondary/10 rounded-md w-3/4 mb-2"></div>
                        <div className="h-4 bg-brand-secondary/10 rounded-md w-1/2 mb-4"></div>
                        <div className="flex justify-between items-center">
                            <div className="h-6 bg-brand-secondary/10 rounded-md w-1/4"></div>
                            <div className="h-10 bg-brand-secondary/10 rounded-full w-10"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
