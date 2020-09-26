(
	(init) => {
		init();
		const handleNavi = navArray => {
			navArray.forEach((navItem,index) => {
				navItem.addEventListener('click', (e) => {
					deactiveCurrentNav(navArray, index, (clickedNav) => {
						clickedNav.classList.add('selected')
						updateBody(clickedNav)
					})
				})
			});
		}
		const deactiveCurrentNav = (navArray, index, callback) => {
			let currentActive = [...navArray].findIndex(nav => nav.className === 'selected')
			if( currentActive !== index ) {
				navArray[currentActive].classList.remove('selected')
				callback(navArray[index])
			}
		}
		const removeEvents = eventList => {

		}
		const updateBody = (selectedNav) => {
			const body = $('.work')
			let properties = {
				label: selectedNav.innerHTML,
				hasKey: selectedNav.innerHTML === 'Hashing' ? false : true,
			}
			body.innerHTML = contents(properties)
			switch (selectedNav.innerHTML){
				case 'Encrypt': handleEncryptPanel() ;break;
				case 'Decrypt': handleDecryptPanel() ;break;
				case 'Hashing': handleHashingPanel() ;break;
			}
		}
		const showResultPanel = (result) => {
			const resultPanel = $('#result')
			const resultPanelWrapper = $('.result-wrapper')
			resultPanelWrapper.classList.remove('hide');
			const resultTemplate = (text,val) => `
			<label class="mainlabel">${text}</label>
			<input readonly class="resultlab" value="${val}" />
			<a class="info">Click textbox to copy</a>
			`
			let toWrite = '<img id="close" src="assets/close.svg" alt="Close" />'

			for(key in result){
				if(result.hasOwnProperty(key)){
					toWrite += resultTemplate(key, result[key])
				}
			}
			resultPanel.innerHTML = toWrite
			$$('.resultlab').forEach(i => {
				i.addEventListener('click',(e) => {
					e.target.select();
					e.target.setSelectionRange(0, 99999)
					document.execCommand("copy");
					$('.popup').classList.remove('hide')
					setTimeout(() => {
						$('.popup').classList.add('hide')
					}, 3000);
				})
			})
			$('#close').addEventListener('click', e => {
				resultPanelWrapper.classList.add('hide')
			})
		}

		const onEncryption = () => {
			const keyGenerationCheck = $('#gkey')
			const keyTextBox = $('#key')
			const encryptButton = $('#submit')
			keyGenerationCheck.addEventListener('change', (e) => {
				if(e.target.checked) keyTextBox.disabled = true
				else keyTextBox.disabled = false
			})
			encryptButton.addEventListener('click',async e => {
				const plainText = $('#plaintext').value
				let key = keyTextBox.value
				let cipherText = ''
				if(!key || keyGenerationCheck.checked){
					key = Math.random().toString(36).substring(7);
				}
				if(plainText) {
					try {
						cipherText = AesCtr.encrypt(plainText, key, 256)
						showResultPanel({'Cipher Text': cipherText, 'Key': key})
					}catch (e){
						$('#error').innerHTML = 'Invalid Inputs'
						setTimeout(() => {
							$('#error').innerHTML = ''
						}, 4000)
					}
				}else {
						$('#error').innerHTML = 'Please enter required text.'
						setTimeout(() => {
							$('#error').innerHTML = ''
						}, 5000)
				}
			})
			return [keyGenerationCheck,encryptButton]
		}
		const handleEncryptPanel = () => {
			const methodRadioGp = $N('method')
			methodRadioGp.forEach(element => {
				element.addEventListener('change', e => {
					let checkedRadio = [...methodRadioGp].findIndex(radio => radio.checked)
					console.log(checkedRadio)
					console.log(methodRadioGp)
				})
			});
			return [methodRadioGp, ...onEncryption()] //RETURN a list of event listening objects
		}
		
		const handleDecryptPanel = () => {
			const decryptButton = $('#submit')
			decryptButton.addEventListener('click', e => {
				const cipherText = $('#plaintext').value
				const key = $('#key').value
				let plainText = ''
				if(cipherText && key) {
						try {
							plainText = AesCtr.decrypt(cipherText,key,256)
						showResultPanel({'Plain Text': plainText})
						}catch (e){
							$('#error').innerHTML = 'Invalid Inputs'
							setTimeout(() => {
								$('#error').innerHTML = ''
							}, 5000)
						}
					}else {
						$('#error').innerHTML = 'Please enter required text.'
						setTimeout(() => {
							$('#error').innerHTML = ''
						}, 5000)
				}
			})
			return [decryptButton]
		}
		const sha256 = async (message) => {
			const msgBuffer = new TextEncoder('utf-8').encode(message);                    
			const hashBuffer =await crypto.subtle.digest('SHA-256', msgBuffer);
			const hashArray = Array.from(new Uint8Array(hashBuffer));               
			const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
			return hashHex;
		}
		const handleHashingPanel = () => {
			const hashButton = $('#submit')
			hashButton.addEventListener('click',async e => {
				const plainText = $('#plaintext').value
				let digestedText = ''
				if(plainText) {
						try {
							await sha256(plainText).then(res => digestedText = res)
							showResultPanel({'Hash Value / Digested': digestedText})
						}catch (e){
							$('#error').innerHTML = 'Invalid Inputs'
							setTimeout(() => {
								$('#error').innerHTML = ''
							}, 4000)
						}
					}else {
						$('#error').innerHTML = 'Please enter required text.'
						setTimeout(() => {
							$('#error').innerHTML = ''
						}, 4000)
				}
				
			})
			return [hashButton]
		}
		handleNavi($$('.navi ul li'))	
		handleEncryptPanel()
	}
)(init => { 
	$ = (param) => document.querySelector(param)
	$$ = (param) => document.querySelectorAll(param)
	$N = (name) => document.getElementsByName(name)
	contents = (params) => { return `<form>
			<div>
				<label class="mainlabel" for="plaintext">${params.label === 'Decrypt' ? 'Cipher Text': 'Plain Text'}</label>
				<textarea id="plaintext" cols="10" rows="3" charswidth="23" placehoder="Plain Text"></textarea>
			</div>
			${params.hasKey ? `
			<div>
				<label class="mainlabel" for="key">Key</label>
				<textarea id="key" cols="3" rows="1" charswidth="23"></textarea>
				${params.label !== 'Decrypt' ? '<input type="checkbox" id="gkey" /><label for="gkey">Generate key automatically</label>' : ''}
				
			</div>
			`: ''}
			<p id="error"></p>
			<button type="button" id="submit">${params.label === 'Hashing' ? 'Hash' : params.label}</button>
		</form>`
	}
})
