"""Shared item category classification."""


def _cat(item):
    """Classify a closet item into a category: top, bottom, shoes, dress, or accessory."""
    t = (item.get("type") or item.get("category") or "").lower().strip()
    tops_kw = ("top", "shirt", "blouse", "t-shirt", "tshirt", "camisole", "tank",
               "sweater", "hoodie", "cardigan", "blazer", "vest", "bodysuit",
               "crop top", "tube top", "halter", "jacket", "coat", "outerwear")
    bottoms_kw = ("bottom", "pants", "jeans", "trousers", "shorts", "skirt",
                  "leggings", "chinos", "cargo", "culottes", "palazzo")
    shoes_kw = ("shoes", "footwear", "sneakers", "boots", "sandals", "heels",
                "flats", "loafers", "oxfords", "mules", "wedges", "slides")
    dress_kw = ("dress", "gown", "jumpsuit", "romper", "sundress",
                "maxi dress", "mini dress", "midi dress")
    acc_kw = ("accessory", "bag", "purse", "belt", "hat", "scarf", "jewelry",
              "watch", "sunglasses", "earrings", "necklace", "bracelet", "ring",
              "wallet", "backpack", "tote", "clutch", "headband", "gloves")

    if t in tops_kw or t == "top" or t == "outerwear":
        return "top"
    if t in bottoms_kw or t == "bottom":
        return "bottom"
    if t in shoes_kw or t == "shoes":
        return "shoes"
    if t in dress_kw or t == "dress":
        return "dress"
    if t in acc_kw or t == "accessory":
        return "accessory"

    label = (item.get("label", "") + " " + item.get("name", "") + " " + t).lower()
    for kws, res in [
        (("jacket", "coat", "blazer", "hoodie", "cardigan", "vest"), "top"),
        (("shirt", "blouse", "t-shirt", "tee", "tank", "sweater", "polo", "top"), "top"),
        (("pants", "jeans", "trousers", "shorts", "skirt", "leggings", "bottom"), "bottom"),
        (("shoes", "sneakers", "boots", "sandals", "heels", "flats", "shoe"), "shoes"),
        (("dress", "gown", "jumpsuit", "romper", "sundress"), "dress"),
        (("bag", "hat", "scarf", "jewelry", "watch", "sunglasses", "belt"), "accessory"),
    ]:
        if any(kw in label for kw in kws):
            return res

    return "other"
