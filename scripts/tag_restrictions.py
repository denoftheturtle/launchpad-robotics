import json

p = "site/src/data/employers.json"
d = json.load(open(p))

EDU = ("not eligible", "educational", "education-only", "education only")
NONE_ = ("no match available", "no documented employee match",
         "do not promise a match", "no standard", "nothing documented",
         "no employee match")

counts = {"education-only": 0, "no-program": 0}
for x in d["employers"]:
    t = ((x.get("notes") or "") + " " + (x.get("eligibility") or "")).lower()
    r = None
    if any(k in t for k in EDU):
        r = "education-only"
    elif any(k in t for k in NONE_):
        r = "no-program"
    x["restriction"] = r
    if r:
        counts[r] += 1

json.dump(d, open(p, "w"), indent=2)
print(counts)
for x in d["employers"]:
    if x["restriction"]:
        print(" ", x["slug"], "->", x["restriction"])
