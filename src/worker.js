
import { pipeline,env} from '@xenova/transformers';

// env.localModelPath = '/models/session_gt2d/nospace';
env.remotePathTemplate = '{model}/'
env.allowRemoteModels = true;
env.remoteHost = "https://erl-j.github.io/abc-composer/models/session_gt2d/nospace/"

// env.allowLocalModels = true;
env.useBrowserCache = true;

/**
 * This class uses the Singleton pattern to ensure that only one instance of the
 * pipeline is loaded. This is because loading the pipeline is an expensive
 * operation and we don't want to do it every time we want to translate a sentence.
 */
class MyLMPipeline {
    static task = 'text-generation';
    static model = 'checkpoint-8000';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback:progress_callback});
        }
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    // Retrieve the lm pipeline. When called for the first time,
    // this will load the pipeline and save it for future use.
    let lm = await MyLMPipeline.getInstance(x => {
        console.log("Progress: " + x);
        self.postMessage(x);
    }, 
    );

    let text = event.data.text.trim();

    let stopToken = "€"
    let stopTokenId = lm.tokenizer.encode(stopToken)[0];

    // temperature: 2:
    // max_new_tokens: 10:
    // repetition_penalty: 1.5:
    // // no_repeat_ngram_size: 2,
    // // num_beams: 1,
    // // num_return_sequences: 1,
    // min_tokens:
    // top_k:
    console.log(event.data.generationParams)

    // Actually perform the translation
    let output = await lm(text, {
        ...event.data.generationParams,
        // Allows for partial output
        do_sample: true,
        eos_token_id: stopTokenId,
        callback_function: x => {
            let output = lm.tokenizer.decode(x[0].output_token_ids, { skip_special_tokens: true });
            output = output.replace(stopToken, "");
            self.postMessage({
                status: 'update',
                output: output,
            });
        }
    });

    // remove stop token
    // Send the output back to the main thread
    self.postMessage({
        status: 'complete',
        output: output,
    });
});