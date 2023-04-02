/*
 * @Description: 
 * @version: 
 * @Author: @imdanteking
 * @Date: 2023-03-31 00:56:56
 * @LastEditTime: 2023-04-02 14:21:33
 */
import * as vscode from 'vscode';
import axios from 'axios';
import * as fs from 'fs';
export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('genut.genut', async () => {
		// Display a message box to the user
		vscode.window.showInformationMessage('Generating Unittests...');
		// Get the editor of vscode window
		const editor = vscode.window.activeTextEditor;
		if(!editor) {
			console.log("cannot open editor");
			return;
		}
		// Get the selected content
		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);
		
		// 1. Construct the question
		const beginPrompt = "Please generate unittest for the code below by GoogleTest: \n";
		const connectionPrompt = "My question does not end, please wait for the next part\n";
		const endPrompt = "\nHere is all the code, please generate unittests for me\n";
		const originQuestion = beginPrompt + selectedText;
		const MAX_LENGTH = 2000;
		// 2. Calculate the token amount of your question and if the amount is greater than 2000, cut question into several parts
		const questionLength = originQuestion.length;
		// if(questionLength > MAX_LENGTH) {
			const sendAmount = Math.ceil(questionLength/MAX_LENGTH);
			let questions = [];
			for(let i = 0; i < sendAmount; ++i) {
				let question = originQuestion.slice(MAX_LENGTH*i, MAX_LENGTH*(i+1));
				if(i !== sendAmount - 1) {
					question += connectionPrompt;
				} else {
					question += endPrompt;
				}
				questions.push(question);
			}
		// }
		console.log("question: ", questions[0]);

		// Send request to ChatGPT
		const chaturl = "https://api.openai.com/v1/chat/completions";
		const API_KEY = "";
		const MAX_TOKEN = 1000;
		let context = "Please generate unittest for the code below:\n";
		let code = ""; // The code ChatGPT returns.
		context += selectedText;
		axios.post(chaturl, {
			model:"gpt-3.5-turbo-0301",
			messages: [
				{
					"role": "user",
					"content": questions[0] 
				}
			],
			temperature: 0.7,
			max_tokens: MAX_TOKEN
		}, {
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${API_KEY}`
			}
		}).then(resp=>{
			console.log(resp.data);
			const content = resp.data.choices[0].message["content"];
			if(content.indexOf("```c++") === -1) {
				code = content.slice(content.indexOf("```") + 4, content.lastIndexOf("```"));
			} else {
				code = content.slice(content.indexOf("```c++") + 7, content.lastIndexOf("```"));
			}
			// console.log(resp.data.choices[0].message['content']);
			console.log(code);
			// Write the code into a new file
			const curFileName = vscode.window.activeTextEditor?.document.fileName;
			console.log("curFileName: ", curFileName);
			const curDir = curFileName?.slice(0, curFileName.lastIndexOf("\/"));
			console.log("curDir: ", curDir);
			const newFileName = curDir + "\/" + "test_" + curFileName?.slice(curFileName.lastIndexOf("\/") + 1);
			fs.writeFile(curDir+"/"+newFileName, code, (err)=>{
				if(err) {
					console.error(err);
					return;
				}
				console.log("The unittest file has been saved successfully");
			});

		}).catch(error=>{
			console.log(error);
		});
		

	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}