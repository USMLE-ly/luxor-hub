import { cn } from "@/lib/utils";

interface ImageSource {
  src: string;
  alt: string;
}

interface ShowImageListItemProps {
  text: string;
  images: [ImageSource, ImageSource];
}

function RevealImageListItem({ text, images }: ShowImageListItemProps) {
  const container = "absolute right-8 -top-1 z-40 h-20 w-16";
  const effect =
    "relative duration-500 delay-100 shadow-none group-hover:shadow-xl scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 group-hover:w-full group-hover:h-full w-16 h-16 overflow-hidden transition-all rounded-md";

  return (
    <div className="group relative h-fit w-fit overflow-visible py-8">
      <h1 className="text-7xl font-black text-foreground transition-all duration-500 group-hover:opacity-40">
        {text}
      </h1>
      <div className={container}>
        <div className={effect}>
          <img alt={images[1].alt} src={images[1].src} className="h-full w-full object-cover" />
        </div>
      </div>
      <div
        className={cn(
          container,
          "translate-x-0 translate-y-0 rotate-0 transition-all delay-150 duration-500 group-hover:translate-x-6 group-hover:translate-y-6 group-hover:rotate-12",
        )}
      >
        <div className={cn(effect, "duration-200")}>
          <img alt={images[0].alt} src={images[0].src} className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  );
}

function RevealImageList() {
  const items: ShowImageListItemProps[] = [
    {
      text: "Style DNA",
      images: [
        {
          src: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&auto=format&fit=crop&q=60",
          alt: "Style analysis",
        },
        {
          src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&auto=format&fit=crop&q=60",
          alt: "Fashion styling",
        },
      ],
    },
    {
      text: "AI Outfits",
      images: [
        {
          src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=200&auto=format&fit=crop&q=60",
          alt: "Outfit generation",
        },
        {
          src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&auto=format&fit=crop&q=60",
          alt: "AI fashion",
        },
      ],
    },
    {
      text: "Wardrobe",
      images: [
        {
          src: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200&auto=format&fit=crop&q=60",
          alt: "Smart wardrobe",
        },
        {
          src: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=200&auto=format&fit=crop&q=60",
          alt: "Closet organizer",
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-1 rounded-sm bg-background px-8 py-4">
      <h3 className="text-sm font-black uppercase text-muted-foreground">Our Features</h3>
      {items.map((item, index) => (
        <RevealImageListItem key={index} text={item.text} images={item.images} />
      ))}
    </div>
  );
}

export { RevealImageList, RevealImageListItem };
export type { ShowImageListItemProps, ImageSource };
