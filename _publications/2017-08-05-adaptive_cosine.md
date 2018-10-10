---
title: "Image Compression using Adaptive Quantized Masking of Cosine Basis"
collection: publications
permalink: /publication/ 2017-08-05-adaptive_cosine
excerpt: ''
date: 2017-08-05
venue: '(Accepted) (IEEE) 2016, 6th International Conference on Computer Applications in Electrical Engineering - Recent Advances (CERA)'
---

The classic JPEG and JPEG 2000 compression techniques are often considered as benchmarks in image compression. Both these techniques operate locally on nonoverlapping blocks of size 8x8 pixels in the image. The JPEG
technique is based on Discrete Cosine Transform (DCT), while the JPEG 2000 employs Discrete Wavelet Transform (DWT). In the JPEG compression scheme, the quantization table exploits
the energy compaction property of the DCT. As a result, the more-significant coefficients of the DCT are quantized to a lesser
extent than the less-significant coefficients. The quantization table is fixed for all images, and is designed using human
feedback based on the visual quality of the compressed image. In this article, we propose a compression technique in which, a
quantization table is learned for every image considering the compression ratio required. The global processing involved in
this technique eliminates the blocky effect present in JPEG compressed images due to local quantization. The proposed algorithm also makes sure that the compressed image is close in visual quality to the original image, using learning algorithms.
This closeness in measured using the Mean Squared Error (MSE). Our technique is based on the Lasso regression which provides a sparse quantization table based on the required
compression ratio. The performance of our algorithm is assessed using standard images and is compared with the JPEG 2000
technique.

[PDF]()

