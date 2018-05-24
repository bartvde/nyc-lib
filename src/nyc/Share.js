/**
 * @module nyc/Share
 */

import $ from 'jquery'

import Container from 'nyc/Container'
import ReplaceTokens from 'nyc/ReplaceTokens'

require('es6-promise').polyfill()
require('isomorphic-fetch')

/**
 * @desc Class for providing a set of buttons for social media sharing
 * @public
 * @class
 * @extends module:nyc/Container~Container
 */
class Share extends Container {
	/**
	 * @desc Create an instance of Share
	 * @public
	 * @constructor
	 * @param {module:nyc/Share~Share.Options} options Constructor options
	 */
	constructor(options) {
		super(options.target)
		const share = this
		fetch(options.url || './manifest.webmanifest').then(respose => {
			return respose.json()
		}).then(manifest => {
			manifest.url = document.location.href
			share.append(new ReplaceTokens().replace(Share.HTML, manifest))
			share.hookupEvents()
		})
	}
	/**
	 * @private
	 * @method
	 */
	hookupEvents() {
		const btns = this.find('.btns')
	 	this.find('.btn-shr').click(event => {
			event.stopPropagation()
			btns.fadeToggle(() => {
				$('*').one('click', event => {
					event.stopPropagation()
					if (btns.css('opacity') * 1 === 1) {
						btns.fadeOut()
					}
				})
			})
		})
	}
}


/**
 * @desc Constructor options for {@link module:nyc/Share~Share}
 * @public
 * @typedef {Object}
 * @property {jQuery|Element|string} target The HTML DOM element that will provide share buttons
 * @property {string} url Manifest URL
 */
Share.Options

/**
 * @private
 * @const
 * @type {string}
 */
Share.HTML = '<div class="shr">' +
	'<a class="btn-shr btn-sq rad-all" role="button" title="Share...">' +
		'<span class="screen-reader-only">Share...</span>' +
	'</a>' +
	'<div class="btns">' +
		'<a class="btn-sq rad-all facebook" role="button" href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank" rel="noopener noreferrer" title="Facebook">' +
			'<span class="screen-reader-only">Facebook</span>' +
		'</a>' +
		'<a class="btn-sq rad-all twitter" role="button" href="https://twitter.com/intent/tweet?text=${url} @nycgov&source=webclient" target="_blank" rel="noopener noreferrer" title="Twitter">' +
			'<span class="screen-reader-only">Twitter</span>' +
		'</a>' +
		'<a class="btn-sq rad-all google" role="button" href="https://plus.google.com/share?url=${url}" target="_blank" rel="noopener noreferrer" title="Google+">' +
			'<span class="screen-reader-only">Google+</span>' +
		'</a>' +
		'<a class="btn-sq rad-all linkedin" role="button" href="http://www.linkedin.com/shareArticle?mini=true&url=${url}" target="_blank" rel="noopener noreferrer" title="LinkedIn">' +
			'<span class="screen-reader-only">LinkedIn</span>' +
		'</a>' +
		'<a class="btn-sq rad-all tumblr" role="button" href="http://www.tumblr.com/share/link?url=${url}&name=${name}&description=via%20NYC.gov" target="_blank" rel="noopener noreferrer" title="Tumblr">' +
			'<span class="screen-reader-only">Tumblr</span>' +
		'</a>' +
		'<a class="btn-sq rad-all email" role="button" href="mailto:?subject=${name}&body=${description}%0A%0A${url}" title="email">' +
			'<span class="screen-reader-only">Email</span>' +
		'</a>' +
	'</div>' +
'</div>'

export default Share
