let globalInstanceIndex=0;class HeadingAnchors extends HTMLElement{static register(e){"customElements"in window&&customElements.define(e||"heading-anchors",HeadingAnchors)}static attributes={exclude:"data-ha-exclude",prefix:"prefix",content:"content"};static classes={anchor:"ha",placeholder:"ha-placeholder",srOnly:"ha-visualhide"};static defaultSelector="h2,h3,h4,h5,h6";static css=`
.${HeadingAnchors.classes.srOnly} {
	clip: rect(0 0 0 0);
	height: 1px;
	overflow: hidden;
	position: absolute;
	width: 1px;
}
.${HeadingAnchors.classes.anchor} {
	position: absolute;
	left: var(--ha_offsetx);
	top: var(--ha_offsety);
	text-decoration: none;
	opacity: 0;
}
.${HeadingAnchors.classes.placeholder} {
	opacity: .3;
}
.${HeadingAnchors.classes.anchor}:is(:focus-within, :hover) {
	opacity: 1;
}
.${HeadingAnchors.classes.anchor},
.${HeadingAnchors.classes.placeholder} {
	display: inline-block;
	padding: 0 .25em;

	/* Disable selection of visually hidden label */
	-webkit-user-select: none;
	user-select: none;
}

@supports (anchor-name: none) {
	.${HeadingAnchors.classes.anchor} {
		position: absolute;
		left: anchor(left);
		top: anchor(top);
	}
}`;get supports(){return"replaceSync"in CSSStyleSheet.prototype}get supportsAnchorPosition(){return CSS.supports("anchor-name: none")}constructor(){var e;super(),this.supports&&((e=new CSSStyleSheet).replaceSync(HeadingAnchors.css),document.adoptedStyleSheets=[...document.adoptedStyleSheets,e],this.headingStyles={},this.instanceIndex=globalInstanceIndex++)}connectedCallback(){this.supports&&this.headings.forEach((e,t)=>{var n,o;e.hasAttribute(HeadingAnchors.attributes.exclude)||(n=this.getAnchorElement(e),o=this.getPlaceholderElement(),this.supportsAnchorPosition&&(t=`--ha_${this.instanceIndex}_`+t,o.style.setProperty("anchor-name",t),n.style.positionAnchor=t),e.appendChild(o),e.after(n))})}positionAnchorFromPlaceholder(e){e&&(e=e.closest("h1,h2,h3,h4,h5,h6")).nextElementSibling&&this.positionAnchor(e.nextElementSibling)}positionAnchor(e){var t;e&&e.previousElementSibling&&(t=e.previousElementSibling,this.setFontProp(t,e),this.supportsAnchorPosition||(t=t.querySelector("."+HeadingAnchors.classes.placeholder))&&(e.style.setProperty("--ha_offsetx",t.offsetLeft+"px"),e.style.setProperty("--ha_offsety",t.offsetTop+"px")))}setFontProp(e,n){e=e.querySelector("."+HeadingAnchors.classes.placeholder);if(e){let t=getComputedStyle(e);e=["font-weight","font-size","line-height","font-family"].map(e=>t.getPropertyValue(e));n.style.setProperty("font",e[0]+` ${e[1]}/${e[2]} `+e[3])}}getAccessibleTextPrefix(){return this.getAttribute(HeadingAnchors.attributes.prefix)||"Jump to section titled"}getContent(){return this.hasAttribute(HeadingAnchors.attributes.content)?this.getAttribute(HeadingAnchors.attributes.content):"#"}getPlaceholderElement(){var e=document.createElement("span"),t=(e.setAttribute("aria-hidden",!0),e.classList.add(HeadingAnchors.classes.placeholder),this.getContent());return t&&(e.textContent=t),e.addEventListener("mouseover",e=>{e=e.target.closest("."+HeadingAnchors.classes.placeholder);e&&this.positionAnchorFromPlaceholder(e)}),e}getAnchorElement(e){var t=document.createElement("a"),n=(t.href="#"+e.id,t.classList.add(HeadingAnchors.classes.anchor),this.getContent());return t.innerHTML=`<span class="${HeadingAnchors.classes.srOnly}">${this.getAccessibleTextPrefix()}: ${e.textContent}</span>`+(n?`<span aria-hidden="true">${n}</span>`:""),t.addEventListener("focus",e=>{e=e.target.closest("."+HeadingAnchors.classes.anchor);e&&this.positionAnchor(e)}),t.addEventListener("mouseover",e=>{e=e.target.closest("."+HeadingAnchors.classes.anchor);this.positionAnchor(e)}),t}get headings(){return this.querySelectorAll(this.selector.split(",").map(e=>e.trim()+"[id]"))}get selector(){return this.getAttribute("selector")||HeadingAnchors.defaultSelector}}HeadingAnchors.register();let copyUrlToClipboard=async()=>{try{await navigator.clipboard.writeText(location.href)}catch(e){console.error("Failed to copy: ",e)}},hasMouseMoved=(window.copyUrlToClipboard=copyUrlToClipboard,!1),pageLoadStartTime=Date.now();document.addEventListener("DOMContentLoaded",function(){function s(e){try{var t=atob(e).replace(/[a-zA-Z]/g,function(e){var t=e<="Z"?65:97;return String.fromCharCode((e.charCodeAt(0)-t+13)%26+t)});return t}catch(e){return console.error("Error decoding email:",e),"decoding-error@example.com"}}let e=document.querySelectorAll(".email-address");e.forEach(e=>{e.innerHTML="<em>[click to reveal]</em>"}),document.addEventListener("mousemove",function e(){hasMouseMoved=!0,document.removeEventListener("mousemove",e)},{once:!0}),setTimeout(()=>{e.forEach(n=>{let o=n.dataset.encodedEmail;n.addEventListener("click",function e(t){t.preventDefault(),hasMouseMoved?(t=s(o),n.innerHTML=`<a href="mailto:${t}">${t}</a>`,n.classList.add("revealed"),n.removeEventListener("click",e)):console.log("Email not revealed: No mouse movement detected.")})})},1e3)});export{HeadingAnchors};