# Model Configuration Guide

This project supports flexible model configuration through environment variables, allowing you to use cheaper models during development and premium models in production.

## Environment Variables

The following environment variables control which OpenAI models are used:

### Text Generation Models
- `OPENAI_TEXT_MODEL`: Main model for fashion analysis, storytelling, etc.
- `OPENAI_STEP_NAME_MODEL`: Model for generating progress step names

### Image Generation Models  
- `OPENAI_IMAGE_MODEL`: Model for generating images (`dall-e-2` or `dall-e-3`)
- `OPENAI_IMAGE_SIZE`: Image size (`256x256`, `512x512`, or `1024x1024`)
- `OPENAI_IMAGE_QUALITY`: Image quality (`standard` or `hd`)

### Clothing Items Configuration
- `CLOTHING_ITEMS_MIN`: Minimum number of clothing items to generate
- `CLOTHING_ITEMS_MAX`: Maximum number of clothing items to generate

## Recommended Configurations

### Development (Cheaper/Faster)
```env
OPENAI_TEXT_MODEL=gpt-3.5-turbo
OPENAI_STEP_NAME_MODEL=gpt-3.5-turbo
OPENAI_IMAGE_MODEL=dall-e-2
OPENAI_IMAGE_SIZE=512x512
OPENAI_IMAGE_QUALITY=standard
CLOTHING_ITEMS_MIN=2
CLOTHING_ITEMS_MAX=3
```

### Production (Premium/High-Quality)
```env
OPENAI_TEXT_MODEL=gpt-4o
OPENAI_STEP_NAME_MODEL=gpt-3.5-turbo
OPENAI_IMAGE_MODEL=dall-e-3
OPENAI_IMAGE_SIZE=1024x1024
OPENAI_IMAGE_QUALITY=hd
CLOTHING_ITEMS_MIN=3
CLOTHING_ITEMS_MAX=5
```

## Cost Optimization

### Development Setup
- **GPT-3.5-Turbo**: ~$0.001 per 1K tokens (vs $0.03 for GPT-4o)
- **DALL-E 2**: $0.02 per image (vs $0.08 for DALL-E 3 HD)
- **Fewer clothing items**: 2-3 items reduce API calls
- **Smaller images**: 512x512 saves bandwidth and costs

### Production Setup
- **GPT-4o**: Better quality analysis and storytelling
- **DALL-E 3 HD**: Higher quality fashion images
- **More clothing items**: 3-5 items for complete style boards
- **Larger images**: 1024x1024 for better visual quality

## Example Cost Comparison

For a typical style board generation:

### Development Cost (~$0.15 per generation)
- 6 GPT-3.5 calls: ~$0.06
- 1 main mood board (DALL-E 2): $0.02
- 3 clothing images (DALL-E 2): $0.06
- **Total**: ~$0.14

### Production Cost (~$0.75 per generation)  
- 6 GPT-4o calls: ~$0.30
- 1 main mood board (DALL-E 3 HD): $0.08
- 5 clothing images (DALL-E 3 HD): $0.40
- **Total**: ~$0.78

## Getting Started

1. Copy the appropriate example file:
   ```bash
   # For development
   cp .env.development.example .env.local
   
   # For production  
   cp .env.production.example .env.local
   ```

2. Add your API keys and adjust model settings as needed

3. The application will automatically log the current model configuration on startup:
   ```
   🤖 Model Configuration: {
     textModel: 'gpt-3.5-turbo',
     imageModel: 'dall-e-2',
     clothingItems: '2-3 items'
   }
   ```

## Model Quality Trade-offs

### GPT-3.5-turbo vs GPT-4o
- **Speed**: GPT-3.5 is ~5x faster
- **Cost**: GPT-3.5 is ~30x cheaper
- **Quality**: GPT-4o provides more sophisticated fashion analysis

### DALL-E 2 vs DALL-E 3
- **Speed**: DALL-E 2 is faster to generate
- **Cost**: DALL-E 2 is 4x cheaper (8x for HD)
- **Quality**: DALL-E 3 produces more realistic and detailed images
