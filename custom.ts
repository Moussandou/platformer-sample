
namespace platformer {
    //% blockId=sm_as_platformer_sprite
    //% block="$sprite as platformer sprite"
    export function asPlatformerSprite(sprite: Sprite): PlatformerSprite {
        return sprite as any;
    }
}