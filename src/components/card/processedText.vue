<script>
import { h, defineComponent } from "vue";
import AnswerSpan from "./answerSpan.vue";

export default defineComponent({
	name: "ProcessedText",
	props: {
		text: String,
		answers: Array,
		dialogueIndex: Number,
		isFinished: Boolean,
		hasExercise: Boolean,
	},
	emits: ["toggleExplanation"],
	setup(props, { emit }) {
		const processText = () => {
			if (!props.text.includes("[?]")) {
				return h("span", props.text);
			}

			const parts = props.text.split(/\[[\?]\]/g);
			const result = [];

			parts.forEach((part, i) => {
				result.push(h("span", part));
				if (i < props.answers.length) {
					result.push(
						h(AnswerSpan, {
							text: props.answers[i],
							dialogueIndex: props.dialogueIndex,
							onToggleExplanation: () => {
								if (props.isFinished && props.hasExercise) {
									emit("toggleExplanation");
								}
							},
						})
					);
				}
			});

			return h("span", result);
		};

		return () => processText();
	},
});
</script>
