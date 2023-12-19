
import { pipeline,env} from '@xenova/transformers';

env.localModelPath = '/models/session_gt2d/spaced';
env.allowRemoteModels = false;
env.allowLocalModels = true;
env.useBrowserCache = false;

/**
 * This class uses the Singleton pattern to ensure that only one instance of the
 * pipeline is loaded. This is because loading the pipeline is an expensive
 * operation and we don't want to do it every time we want to translate a sentence.
 */
class MyLMPipeline {
    static task = 'text-generation';
    static model = 'checkpoint-13000';
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
    // Actually perform the translation
    let output = await lm(text, {
        // Allows for partial output
        max_length: 100,
        callback_function: x => {
            let output = lm.tokenizer.decode(x[0].output_token_ids, { skip_special_tokens: true });
            console.log(output);
            self.postMessage({
                status: 'update',
                output: output,
            });
        }
    });

    // Send the output back to the main thread
    self.postMessage({
        status: 'complete',
        output: output,
    });
});