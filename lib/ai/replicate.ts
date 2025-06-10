import Replicate, { type FileOutput } from 'replicate';
import { promises as fs } from 'node:fs';

export const replicate = new Replicate({
	auth: process.env.REPLICATE_API_TOKEN,
});

type GenerateSimpleHeadshotParams = {
	gender: 'male' | 'female';
	background: 'neutral' | 'office' | 'city' | 'nature';
	inputImageUrl: string;
	aspectRatio?: '1:1';
};

export const generateSimpleHeadshot = async (
	params: GenerateSimpleHeadshotParams,
) => {
	return 'https://www.denverheadshotco.com/wp-content/uploads/2024/08/Top-17-Professional-Headshot-Examples-For-Men-Women-2.png';
	// 	const { gender, background, inputImageUrl, aspectRatio = '1:1' } = params;
	// 	const input = {
	// 		gender,
	// 		background,
	// 		input_image: inputImageUrl,
	// 		aspect_ratio: aspectRatio,
	// 	};
	// 	const output = (await replicate.run(
	// 		'flux-kontext-apps/professional-headshot',
	// 		{ input },
	// 	)) as FileOutput;
	// 	console.log(output);

	// 	const blob = await output.blob();
	// 	const buffer = Buffer.from(await blob.arrayBuffer());
	// 	await fs.writeFile('output.png', buffer);
	// 	return output.url().href;
};

// const output = (await replicate.run(
// 	'editr-apps/faceshots:33bb74b80940e17f7907c9c3d42f586c674a81c32e46e92e3eb11f6629f752b5',
// 	{
// 		input: {
// 			image: imageUrl,
// 			width: 640,
// 			height: 640,
// 			prompt:
// 				"Transform this casual photo of a person img into a professional-looking portrait suitable for LinkedIn. The individual should be dressed in business attire, with a confident and approachable expression. The background should be a simple, neutral color to emphasize the person. Ensure the lighting is soft and flattering, highlighting the person's features while maintaining a polished and formal appearance.",
// 			guidance_scale: 0,
// 			safety_checker: true,
// 			negative_prompt: '',
// 			ip_adapter_scale: 0.5,
// 			num_inference_steps: 6,
// 			controlnet_conditioning_scale: 0.5,
// 		},
// 	},
// )) as FileOutput;
