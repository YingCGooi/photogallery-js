$(function() {
	const PHOTOS_URL = '/photos';
	const COMMENTS_URL = '/comments?photo_id=';
	const NEW_COMMENT_PATH = '/comments/new';

	const Template = {
		init() {
			this.compileTemplates();
			this.registerPartials();
			$('script[type$=x-handlebars]').remove();
		},

		compileTemplates() {
			$('script[type$=x-handlebars]').each(function() {
				Template[this.id] = Handlebars.compile(this.innerHTML);
			});
		},

		registerPartials() {
			$('[data-type=partial]').each(function() {
				Handlebars.registerPartial(this.id, this.innerHTML);
			});
		}
	};

	const SlideShow = {
		init() {
			this.photoId = 1;
			this.photoData = null;

			$.getJSON(PHOTOS_URL, json => {
				this.photoData = json;
				this.renderSlideshow(json);
				this.renderPhotoInfo(json);
			});

			this.loadComments();
			this.bindEvents();
		},

		renderSlideshow(json) {
			const slidesHtml = Template.photos({ photos: json });
			$('#slides').html(slidesHtml);
		},

		renderPhotoInfo(json) {
			const photosInfoHtml = Template.photo_information(json[this.photoId - 1]);
			$('section > header').html(photosInfoHtml);
		},

		renderComments(json) {
			const commentsHtml = Template.comments({ comments: json });
			$('#comments > ul').html(commentsHtml);
		},

		appendComment(json) {
			const commentHTML = Template.comment(json);
			$('#comments > ul').append(commentHTML);			
		},

		loadComments() {
			$.getJSON(COMMENTS_URL + this.photoId, this.renderComments);
		},

		bindEvents() {
			$('#slideshow').on('click', 'li > a', this.changeSlides.bind(this));
			$('section > header').on('click', '.actions > a', this.incrementCount.bind(this));
			$('#comments form').on('submit', this.updateComments.bind(this));
		},

		changeSlides(event) {
			const className = event.target.className;
			event.preventDefault();

			if (className === 'prev') this.setPrevId();
			if (className === 'next') this.setNextId();
			this.updatePage();
		},

		setPrevId() {
			const max = this.photoData.length;
			this.photoId = (this.photoId === 1 ? max : this.photoId - 1);
		},

		setNextId() {
			const max = this.photoData.length;
			this.photoId = (this.photoId === max ? 1 : this.photoId + 1);
		},

		updateSlide() {
			$('#slides figure').fadeOut()
												 .filter(`[data-id=${this.photoId}]`)
												 .fadeIn();
		},

		updatePage() {
			this.updateSlide();
			this.renderPhotoInfo(this.photoData);
			this.loadComments();
		},

		incrementCount(event) {
			const path = event.target.getAttribute('href');
			event.preventDefault();

			$.post(path, { photo_id: this.photoId }, json => {
				this.updateCount(event.target, json);
			});
		},

		updateCount(element, json) {
			this.replaceDigits(element, json.total);
			this.loadNewPhotoData();
		},

		replaceDigits(element, number) {
			const oldText = element.textContent;
			element.textContent = oldText.replace(/\d+/, number);
		},

		loadNewPhotoData() {
			$.getJSON(PHOTOS_URL, json => { this.photoData = json });
		},

		updateComments(event) {
			event.preventDefault();
			const form = event.target;
			form.photo_id.value = this.photoId;

			$.post(NEW_COMMENT_PATH, $(form).serialize(), this.appendComment);
			form.reset();
		},
	}

	Template.init();
	SlideShow.init();
});