import sys, json
import tqdm

if __name__=="__main__":
    with open(sys.argv[1]) as f, open(sys.argv[2],"w") as wf:
        data=[]
        for line in tqdm.tqdm(f):
            uuid = line.strip().split("@@@@@@")[0]
            dial = line.strip().split("@@@@@@")[-1].split("||||||")
            if uuid =="1":
                continue
            if len(dial) < 4 or len(dial)>20:
                continue
            data.append({"data":dial,"label":None})
        print("writting", len(data))
        json.dump(data, wf, ensure_ascii=False, indent=2)