---
permalink: /projects/tara
title: "TARA"
collection: projects
venue: "Tata Institute of Fundamental Research"
period: "July-December 2016"
---

{% include base_path %}

Modern processors execute multiple instructions in parallel, executing each instruction as soon as its operands are available. To prohibit harmful weak memory behaviors, the programmer has to introduce barrier instructions that block the reordering of memory events. TARA algorithmically determines an optimal placement of fences that ensure that, given a concurrent program and a safety property which holds under sequential consistency, the property holds for finite unrolling of loops. It accepts concurrent traces in a custom language or C++ programs and returns a succinct error explanation in the form of a DNF formula. TARA supports TSO, PSO, RMO, Alpha and Power memory consistency architectures. <br/>
[__Github repo__](https://github.com/ashutosh0gupta/TARA/commits?author=shraddhabarke){:target="_blank"}
