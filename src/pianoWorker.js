
import { pipeline, TextStreamer, TextGenerationPipeline, env, AutoTokenizer, PreTrainedTokenizer, AutoModelForCausalLM} from '@huggingface/transformers';



// env.localModelPath = '../public/models/session_gt2d/nospace';
env.localModelPath = '../public/models/';

// env.remotePathTemplate = '{model}/'
env.allowRemoteModels = false;
// env.remoteHost = "https://erl-j.github.io/abc-composer/models/session_gt2d/nospace/"

env.allowLocalModels = true;
env.useBrowserCache = false;

/**
 * This class uses the Singleton pattern to ensure that only one instance of the
 * pipeline is loaded. This is because loading the pipeline is an expensive
 * operation and we don't want to do it every time we want to translate a sentence.
 */
class MyLMPipeline {
    static task = 'text-generation';
    static model = 'model_tjs_long';
    // static model = 'model_tjs_loops';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback: progress_callback, 
                // dtype: "fp16",
                device: "webgpu",
                // dtype: "int8",
                dtype : "q4"
            });
        }

        
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    // Retrieve the lm pipeline. When called for the first time,
    // this will load the pipeline and save it for future use.
    let lm = await MyLMPipeline.getInstance(x => {
        self.postMessage(x);
    }, 
    );
    
    let text = event.data.text;



    let stopToken = "EOS_None"
    let stopTokenId = lm.tokenizer.encode(stopToken)[0];

    // temperature: 2:
    // max_new_tokens: 10:
    // repetition_penalty: 1.5:
    // // no_repeat_ngram_size: 2,
    // // num_beams: 1,
    // // num_return_sequences: 1,
    // min_tokens:
    // top_k:
    let gen = ""
    const streamer = new TextStreamer(lm.tokenizer, {
        skip_prompt: false,
        callback_function: (text) => {
            gen += " " +text;
            self.postMessage({
                status: 'update',
                output: gen,
            })
        }
    })

    console.log(text);

    // Actually perform the translation
    let output = await lm(text, {
        ...event.data.generationParams,
        // Allows for partial output
        do_sample: true,
        eos_token_id: stopTokenId,
        // callback_function: x => {
        //     console.log(x)            
        //     self.postMessage({
        //         status: 'update',
        //         output: x[0].generated_text,
        //     });
        // }
        streamer: streamer,
    });

    console.log(output[0].generated_text);

    console.log(lm.tokenizer.encode(output[0].generated_text));

    // console.log("output: ", output);
    // remove stop token
    // Send the output back to the main thread
    self.postMessage({
        status: 'complete',
        output: output[0].generated_text,
    });
});