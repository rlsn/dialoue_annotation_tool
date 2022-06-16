function escapeHtml(unsafe)
{
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
const default_label = -1;
const sample_per_page = 15;

class Chatbox {
    constructor() {
        this.args = {
            chatBox: document.querySelector('.chatbox__support'),
            submitButton: document.querySelector('.submit__button')
        }
        this.sample_index = 0;
        this.sample_label = default_label;
        this.messages = [];
        this.dataView = [];
    }

    display() {
        const {chatBox, submitButton} = this.args;

        submitButton.addEventListener('click', () => this.onSubmitButton(chatBox))

        // const node = chatBox.querySelector('input');
        // node.addEventListener("keyup", ({key}) => {
        //     if (key === "Enter") {
        //         this.onSubmitButton(chatBox)
        //     }
        // })
        this.getNextSample(chatBox);
        this.getDataPage(chatBox);
    }

    getDataPage(chatbox) {
        let page_num = Math.floor(this.sample_index/sample_per_page);
        let start = parseInt(page_num*sample_per_page);
        let end = start+sample_per_page;
        fetch('/get_page', {
            method: 'POST',
            body: JSON.stringify({index: start, end: end}),
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
          })
          .then(r => r.json())
          .then(r => {
            this.dataView=r;
            this.updateDataView(chatbox);
        }).catch((error) => {
            console.error('Error:', error);
            this.updateDataView(chatbox)
        });
    }

    updateDataView(chatbox) {
        var html = '';
        const div_indice = [];
        this.dataView.forEach(function(item, i) {
            let label = item.label;
            let index = item.index;
            let data = item.data;
            let show_index = label;
            let type = "";
            if (label===-1){
                show_index = data.length-1;
            }
            if (label===null){
                show_index = data.length-1;
                type = "datapoint__item--unlabeled";
            }
            if (index==this.sample_index){
                type = "datapoint__item--current";
            }
            let text = index.toString()+":"+data[show_index].message;
            html += '<div class="datapoint__item '+type+'">' + text + '</div>';
            
          });

        const chatmessage = chatbox.querySelector('.chatbox__datapoints');
        chatmessage.innerHTML = html;

        // button_indice.forEach(function(item, index){
        //     let button_name = '.negative_'+item.toString();
        //     let button = chatmessage.querySelector(button_name);
        //     button.addEventListener('click', () => this.onLabelButton(button, item));
        // }, this);
    }


    getSample(chatbot, index){

    }

    getNextSample(chatbox) {
        fetch('/next', {
            method: 'POST',
            body: JSON.stringify(),
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
          })
          .then(r => r.json())
          .then(r => {
            // console.log(r);
            this.sample_index=r.index;
            this.messages=r.data;
            this.updateChatText(chatbox);
            this.getDataPage(chatbox);
        }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox)
          });
    }

    onSubmitButton(chatbox) {
        // var textField = chatbox.querySelector('input');
        // let text1 = escapeHtml(textField.value);
        // if (text1 === "") {
        //     return;
        // }

        // let msg1 = { name: "User", message: text1 }
        // this.messages.push(msg1);
        // this.updateChatText(chatbox);
        // textField.value = ''
        fetch('/submit', {
            method: 'POST',
            body: JSON.stringify({ index: this.sample_index, label:this.sample_label }),
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
          }).then(r => {
            this.getNextSample(chatbox);
          }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox);
          });
    }

    onLabelButton(button, index){
        if (this.sample_label === index){
            this.sample_label = default_label;
        } else {
            this.sample_label = index;
        }
        console.log(this.sample_label)
    }

    updateChatText(chatbox) {
        var html = '';
        const button_indice = [];
        this.messages.forEach(function(item, index) {
            if (item.name === "Chatbot")
            {
                let button_name = 'negative_'+index.toString();
                button_indice.push(index);
                html += '<div class="messages__item messages__item--visitor '
                html += button_name+' ">' + item.message + '</div>';
            }
            else
            {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>';
            }
          });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;

        button_indice.forEach(function(item, index){
            let button_name = '.negative_'+item.toString();
            let button = chatmessage.querySelector(button_name);
            button.addEventListener('click', () => this.onLabelButton(button, item));
        }, this);
    }
}

const chatbox = new Chatbox();
chatbox.display();