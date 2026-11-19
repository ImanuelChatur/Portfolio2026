---
title: DICOM Medical Image Integrity System
date: 2026-01-01
summary: A prototype that verifies medical image integrity using Hu-moment hashing, DWT-DCT watermarking, and Henon-map encryption.
tags: [Python, NumPy, Cryptography, Image Processing]
featured: true
---

## Overview
A prototype system to verify the integrity of medical images stored in DICOM format.

## How it works
- Extracts pixel arrays with NumPy and computes Hu moment features to generate image integrity hashes
- Segments regions of interest and non-interest using Otsu's thresholding
- Embeds an invisible watermark with a DWT-DCT algorithm
- Encrypts pixel data using Henon-map-based encryption
