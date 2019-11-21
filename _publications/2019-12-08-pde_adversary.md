---
title: "Adversaries meet Partial Differential Equations - A First Look at Fluidic Adversarial Robustification"
collection: publications
permalink: /publication/2019-12-08-pde_adversary
excerpt: ''
date: 2019-12-08
venue: 'IEEE 21st International Symposium on Multimedia (ISM), 2019'
---

Machine Learning models are vulnerable to adversarial examples, viz. these models misclassify data points which are slightly deviated from the correctly classified examples drawn from the same data distribution. These adversarial examples are a result of and reveal inherent blind spots in our training algorithms. In this article, we proposed to build a blind robustification system which can be applied on all input samples such that it targets to retrieve the original labels of adversarial examples without causing changes to the prediction of non-adversarial samples. We first concretely propose an energy functional designed to target adversarial perturbation. We then derive its gradient descent flow equation using the Euler-Lagrange method. Following this, we derive an efficient discretization scheme for the proposed partial differential equations. Finally, we perform a thorough analysis of the performance of the proposed system by testing it for a state-of-art network and a universal bench-marking dataset.
