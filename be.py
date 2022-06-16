import random
import json
from flask import Flask
import torch
import time
import os
import logging
import threading
import queue
# from functools import partial

app = Flask(__name__)

class AutoSaver(threading.Thread):
    def __init__(self, q):
        threading.Thread.__init__(self)
        self.q = q

    def run(self):
        while True:
            f = self.q.get()
            f()
            self.q.task_done()

class BE(object):
    def __init__(self):
        self.q = queue.Queue()
        self.saver = AutoSaver(self.q)
        self.data = None
        self.saver.start()

    def load(self, data_path):
        self.data_path = data_path
        self.data = []
        with open(data_path) as f:
            self.data = json.load(f)
        app.logger.info(f"loaded {len(self.data)} data from {data_path}")
        self.next_unlabeled = 0
        self._get_next_unlabeled()

    def save(self):
        with open(self.data_path,"w") as wf:
            json.dump(self.data, wf, ensure_ascii=False, indent=2)
        app.logger.info(f"saved data to {self.data_path}")


    def _data_process(self, index):
        x = self.data[index]
        result = []
        for i, line in enumerate(x['data']):
            result.append({
                "name":"Chatbot" if i%2 else "User",
                "message": line
                })
        return {"index":index,"data":result,"label":x['label']}

    def _get_next_unlabeled(self):
        while self.data[self.next_unlabeled]['label'] is not None:
            self.next_unlabeled += 1
            if self.next_unlabeled>=len(self.data):
                self.next_unlabeled = 0
                break

    def get_sample(self, index=None, end=None):
        if self.data is None:
            return None
        if index is None:
            index = self.next_unlabeled
        if end is None:
            return self._data_process(index)
        else:
            return [self._data_process(i) for i in range(index, min(end,len(self.data)))]

    def label(self, index, label):
        self.data[index]['label'] = label
        self.next_unlabeled = index
        self._get_next_unlabeled()
        self.q.put(self.save)

    def __len__(self):
        return len(self.data)

if __name__ == "__main__":
    be = BE()

    be.load("data/data.json")
    print(be[0])
    be.label(0,2)