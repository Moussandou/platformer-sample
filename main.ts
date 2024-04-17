namespace SpriteKind {
    export const CharacterSelect = SpriteKind.create()
    export const CameraSprite = SpriteKind.create()
    export const Decoration = SpriteKind.create()
    export const FallingBlock = SpriteKind.create()
}
namespace NumProp {
    export const IdleInterval = NumProp.create()
    export const WalkingInterval = NumProp.create()
}
namespace StrProp {
    export const Name = StrProp.create()
}
namespace ImageProp {
    export const Sideways = ImageProp.create()
}
namespace ImageArrayProp {
    export const WalkingRight = ImageArrayProp.create()
    export const IdleRight = ImageArrayProp.create()
}
namespace MultiplayerState {
    export const IsPickedUp = MultiplayerState.create()
    export const IsHoldingPlayer = MultiplayerState.create()
    export const BreakawayPresses = MultiplayerState.create()
    export const StunTimer = MultiplayerState.create()
    export const SelectedCharacter = MultiplayerState.create()
    export const LockedInCharacter = MultiplayerState.create()
    export const Joined = MultiplayerState.create()
    export const IsRespawnReadyToDrop = MultiplayerState.create()
    export const InvincibleEndTime = MultiplayerState.create()
    export const IsWaitingToRespawn = MultiplayerState.create()
    export const DeathsThisRound = MultiplayerState.create()
    export const SelfKOs = MultiplayerState.create()
    export const ThrownBy = MultiplayerState.create()
    export const ThrowByEndTime = MultiplayerState.create()
    export const RespawnTimer = MultiplayerState.create()
    export const Stock = MultiplayerState.create()
    export const LostLastStockTime = MultiplayerState.create()
}
function drawWavyRainbowText (sprite: Sprite, screen2: Image) {
    for (let x = 0; x <= sprite.width; x++) {
        tempNumber = Math.round(Math.sin(spriteutils.degreesToRadians(x + Math.idiv(game.runtime(), 3))) * -2) + 3
        for (let y = 0; y <= sprite.height; y++) {
            if (sprite.image.getPixel(x, y) == 1) {
                screen2.setPixel(sprite.left + x, sprite.top + (y + tempNumber), 12)
            } else if (sprite.image.getPixel(x, y) != 0) {
                screen2.setPixel(sprite.left + x, sprite.top + (y + tempNumber), titleColors[Math.round((x + Math.idiv(sprite.top + y, 2) + Math.idiv(game.runtime(), 10)) / 30) % 4])
            }
        }
    }
}
spriteutils.addEventHandler(spriteutils.UpdatePriorityModifier.Before, spriteutils.UpdatePriority.Physics, function () {
    for (let value of sprites.allOfKind(SpriteKind.Player)) {
        if (sprites.readDataNumber(value, "conveyorVelocityNextFrame") != 0) {
            value.vx += sprites.readDataNumber(value, "conveyorVelocityNextFrame")
            sprites.setDataNumber(value, "conveyorVelocity", sprites.readDataNumber(value, "conveyorVelocityNextFrame"))
            sprites.setDataNumber(value, "conveyorVelocityNextFrame", 0)
        }
    }
})
controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameState == "character-select") {
        if (allPlayersAreLockedIn()) {
            startPlaying()
        }
    }
})
sprites.onDestroyed(SpriteKind.FallingBlock, function (sprite) {
    tempSprite = sprites.create(assets.tile`myTile12`, SpriteKind.Decoration)
    tiles.setWallAt(sprite.tilemapLocation(), false)
    tiles.placeOnTile(tempSprite, sprite.tilemapLocation())
    tempSprite.ay = 500
    tempSprite.setFlag(SpriteFlag.AutoDestroy, true)
    tempSprite.setFlag(SpriteFlag.Ghost, true)
})
function createCharacter (templateIndex: number) {
    tempPSprite = platformer.create(img`
        3 3 3 3 3 
        3 3 3 3 3 
        3 3 3 3 3 
        3 3 3 3 3 
        3 3 3 3 3 
        3 3 3 3 3 
        3 3 3 3 3 
        3 3 3 3 3 
        `, SpriteKind.Player)
    blockObject.storeOnSprite(characterTemplates[templateIndex], tempPSprite)
    platformer.loopFrames(
    tempPSprite,
    blockObject.getImageArrayProperty(blockObject.getStoredObject(tempPSprite), ImageArrayProp.WalkingRight),
    blockObject.getNumberProperty(blockObject.getStoredObject(tempPSprite), NumProp.WalkingInterval),
    platformer.rule(platformer.PlatformerSpriteState.FacingRight, platformer.PlatformerSpriteState.Moving)
    )
    platformer.loopFrames(
    tempPSprite,
    blockObject.getImageArrayProperty(blockObject.getStoredObject(tempPSprite), ImageArrayProp.IdleRight),
    blockObject.getNumberProperty(blockObject.getStoredObject(tempPSprite), NumProp.IdleInterval),
    platformer.rule(platformer.PlatformerSpriteState.FacingRight)
    )
    platformer.loopFrames(
    tempPSprite,
    flipAnimation(blockObject.getImageArrayProperty(blockObject.getStoredObject(tempPSprite), ImageArrayProp.WalkingRight)),
    blockObject.getNumberProperty(blockObject.getStoredObject(tempPSprite), NumProp.WalkingInterval),
    platformer.rule(platformer.PlatformerSpriteState.FacingLeft, platformer.PlatformerSpriteState.Moving)
    )
    platformer.loopFrames(
    tempPSprite,
    flipAnimation(blockObject.getImageArrayProperty(blockObject.getStoredObject(tempPSprite), ImageArrayProp.IdleRight)),
    blockObject.getNumberProperty(blockObject.getStoredObject(tempPSprite), NumProp.IdleInterval),
    platformer.rule(platformer.PlatformerSpriteState.FacingLeft)
    )
    return tempPSprite
}
mp.onButtonEvent(mp.MultiplayerButton.A, ControllerButtonEvent.Pressed, function (player2) {
    if (gameState == "character-select") {
        if (mp.getPlayerState(player2, MultiplayerState.Joined) == 0) {
            mp.setPlayerState(player2, MultiplayerState.Joined, 1)
        } else {
            mp.setPlayerState(player2, MultiplayerState.LockedInCharacter, 1)
        }
    } else if (gameState == "playing") {
        if (mp.getPlayerState(player2, MultiplayerState.IsRespawnReadyToDrop) == 1) {
            dropPlayer(player2)
        }
    }
})
spriteutils.createRenderable(10, function (screen2) {
    for (let value of mp.allPlayers()) {
        if (mp.getPlayerState(value, MultiplayerState.IsRespawnReadyToDrop) == 1) {
            spriteutils.drawTransparentImage(img`
                b b b b b b b b b b 
                . b b b b b b b b . 
                . . . . c c . . . . 
                . b b b b b b b b . 
                `, screen2, mp.getPlayerSprite(value).left - scene.cameraProperty(CameraProperty.Left) - 3, mp.getPlayerSprite(value).bottom - scene.cameraProperty(CameraProperty.Top))
        }
    }
})
function turnOnWalls (tile: Image) {
    for (let value of tiles.getTilesByType(tile)) {
        tiles.setWallAt(value, true)
    }
}
function allPlayersAreLockedIn () {
    return debug || mp.getPlayerState(mp.PlayerNumber.One, MultiplayerState.LockedInCharacter) != 0 && ((mp.getPlayerState(mp.PlayerNumber.Two, MultiplayerState.LockedInCharacter) != 0 || mp.getPlayerState(mp.PlayerNumber.Two, MultiplayerState.Joined) == 0) && ((mp.getPlayerState(mp.PlayerNumber.Three, MultiplayerState.LockedInCharacter) != 0 || mp.getPlayerState(mp.PlayerNumber.Three, MultiplayerState.Joined) == 0) && (mp.getPlayerState(mp.PlayerNumber.Four, MultiplayerState.LockedInCharacter) != 0 || mp.getPlayerState(mp.PlayerNumber.Four, MultiplayerState.Joined) == 0)))
}
scene.onOverlapTile(SpriteKind.Player, assets.tile`myTile10`, function (sprite, location) {
    if (sprite.left < location.right - 4) {
        respawnCharacter(mp.indexToPlayer(players.indexOf(sprite)))
    }
})
mp.onButtonEvent(mp.MultiplayerButton.Right, ControllerButtonEvent.Pressed, function (player2) {
    if (gameState == "character-select") {
        changeCharacterSelect(player2, false)
    }
})
function markThrownBy (thrower: number, throwee: number) {
    mp.setPlayerState(throwee, MultiplayerState.ThrownBy, thrower)
    mp.setPlayerState(throwee, MultiplayerState.ThrowByEndTime, game.runtime() + koAttributionTime)
    if (mp.getPlayerState(throwee, MultiplayerState.IsHoldingPlayer) != 0) {
        markThrownBy(thrower, mp.getPlayerState(throwee, MultiplayerState.IsHoldingPlayer))
    }
}
spriteutils.addEventHandler(spriteutils.UpdatePriorityModifier.After, spriteutils.UpdatePriority.Physics, function () {
    for (let value of sprites.allOfKind(SpriteKind.Player)) {
        if (sprites.readDataNumber(value, "conveyorVelocity") != 0) {
            value.vx += 0 - sprites.readDataNumber(value, "conveyorVelocity")
            sprites.setDataNumber(value, "conveyorVelocity", 0)
        }
    }
})
function drawWavyRainbow (source: Image, screen2: Image) {
    for (let x = 0; x <= 115; x++) {
        tempNumber = Math.round(Math.sin(spriteutils.degreesToRadians(x + Math.idiv(game.runtime(), 3))) * -2) + 3
        for (let y = 0; y <= 32; y++) {
            if (source.getPixel(x, y) != 0) {
                screen2.setPixel(22 + x, y + tempNumber, titleColors[Math.round((x + Math.idiv(y, 2) + Math.idiv(game.runtime(), 10)) / 30) % 4])
            }
        }
    }
}
spriteutils.createRenderable(100, function (screen2) {
    if (gameState == "end") {
        screen2.fill(11)
        drawWavyRainbow(img`
            ..............aaaaaaaaa....aaaaaaaaaa......aaaaaaa...aa......aa...aa..........aaaaaaaaaa......aaaaaaa...............
            .............aaaaaaaaaaa..aaaaaaaaaaaa...aaaaaaaaaa.aaaa....aaaa.aaaa........aaaaaaaaaaaa...aaaaaaaaaa..............
            .............aaaaaaaaaaaa.aaaaaaaaaaaa..aaaaaaaaaaa.aaaa....aaaa.aaaa........aaaaaaaaaaaa..aaaaaaaaaaa..............
            .............aaaaaaaaaaaa.aaaaaaaaaaa...aaaaaaaaaa..aaaa....aaaa.aaaa.........aaaaaaaaaa...aaaaaaaaaa...............
            .............aaaa...aaaaa.aaaa.........aaaaaa.......aaaa....aaaa.aaaa............aaaa.....aaaaaa....................
            .............aaaa....aaaa.aaaa.........aaaaa........aaaa....aaaa.aaaa............aaaa.....aaaaa.....................
            .............aaaa....aaaa.aaaaaa.......aaaaaaaaaa...aaaa....aaaa.aaaa............aaaa.....aaaaaaaaaa................
            .............aaaa...aaaaa.aaaaaaa......aaaaaaaaaaa..aaaa....aaaa.aaaa............aaaa.....aaaaaaaaaaa...............
            .............aaaaaaaaaaaa.aaaaaaa.......aaaaaaaaaaa.aaaa....aaaa.aaaa............aaaa......aaaaaaaaaaa..............
            .............aaaaaaaaaaa..aaaaaa.........aaaaaaaaaa.aaaa....aaaa.aaaa............aaaa.......aaaaaaaaaa..............
            .............aaaaaaaaaa...aaaa................aaaaa.aaaa....aaaa.aaaa............aaaa............aaaaa..............
            .............aaaaaaaaaaa..aaaa...............aaaaaa.aaaaa..aaaaa.aaaa............aaaa...........aaaaaa..............
            .............aaaa..aaaaa..aaaaaaaaaaa...aaaaaaaaaa...aaaaaaaaaa..aaaaaaaaaaa.....aaaa......aaaaaaaaaa...............
            .............aaaa..aaaaaa.aaaaaaaaaaaa.aaaaaaaaaaa...aaaaaaaaaa..aaaaaaaaaaaa....aaaa.....aaaaaaaaaaa...............
            .............aaaa...aaaaa.aaaaaaaaaaaa.aaaaaaaaaa.....aaaaaaaa...aaaaaaaaaaaa....aaaa.....aaaaaaaaaa................
            ..............aa.....aaa...aaaaaaaaaa...aaaaaaa.........aaaa......aaaaaaaaaa......aa.......aaaaaaa..................
            ....................................................................................................................
            ....................................................................................................................
            ....................................................................................................................
            ....................................................................................................................
            ....................................................................................................................
            ....................................................................................................................
            ....................................................................................................................
            ....................................................................................................................
            ....................................................................................................................
            ....................................................................................................................
            ....................................................................................................................
            ....................................................................................................................
            ....................................................................................................................
            ....................................................................................................................
            ....................................................................................................................
            ....................................................................................................................
            ....................................................................................................................
            `, screen2)
        for (let value of mp.allPlayers()) {
            if (mp.getPlayerState(value, MultiplayerState.Joined) != 0) {
                screen2.fillRect(3 + 39 * (value - 1), 40, 37, 61, 15)
                drawKOLog(value, 4 + 39 * (value - 1), 41, 5, screen2)
                if (winners.indexOf(value) != -1) {
                    drawWavyRainbowText(characterSelectText[mp.playerToIndex(value)], screen2)
                }
            }
        }
    }
})
spriteutils.createRenderable(100, function (screen2) {
    if (gameState == "playing" && gameMode == "race") {
        for (let value of mp.allPlayers()) {
            if (mp.getPlayerState(value, MultiplayerState.Joined) != 0) {
                drawLives(mp.getPlayerState(value, MultiplayerState.Stock), 10 + (value - 1) * 37, 114, screen2, [
                0,
                2,
                8,
                4,
                6
                ][value])
            }
        }
    }
})
function breakaway (picker: number, upper: number) {
    mp.setPlayerState(picker, MultiplayerState.IsHoldingPlayer, 0)
    resetPlayerAfterHeld(upper, true)
    mp.setPlayerState(picker, MultiplayerState.StunTimer, game.runtime() + breakawayStunTime)
    platformer.setCharacterAnimationsEnabled(platformer.asPlatformerSprite(mp.getPlayerSprite(picker)), true)
    setControlsEnabled(picker, false)
}
function drawKOLog (player2: number, left: number, top: number, columns: number, screen2: Image) {
    col = 0
    row = 0
    for (let value of KOLog) {
        if (value[0] == player2) {
            spriteutils.drawTransparentImage(blockObject.getImageArrayProperty(blockObject.getStoredObject(mp.getPlayerSprite(value[1])), ImageArrayProp.IdleRight)[0], screen2, left + col * 7, top + 9 * row)
            col += 1
            if (col == columns) {
                col = 0
                row += 1
            }
        }
    }
}
mp.onButtonEvent(mp.MultiplayerButton.B, ControllerButtonEvent.Pressed, function (player2) {
    if (gameState == "playing") {
        if (mp.getPlayerState(player2, MultiplayerState.StunTimer) == 0) {
            if (mp.getPlayerState(player2, MultiplayerState.IsPickedUp) != 0) {
                mp.changePlayerStateBy(player2, MultiplayerState.BreakawayPresses, 1)
                if (mp.getPlayerState(player2, MultiplayerState.BreakawayPresses) == 20) {
                    breakaway(mp.getPlayerState(player2, MultiplayerState.IsPickedUp), player2)
                }
            } else {
                if (mp.getPlayerState(player2, MultiplayerState.IsHoldingPlayer) == 0) {
                    if (mp.getPlayerState(player2, MultiplayerState.IsPickedUp) == 0) {
                        for (let value of mp.allPlayers()) {
                            if (mp.getPlayerState(value, MultiplayerState.StunTimer) == 0 && (mp.getPlayerState(value, MultiplayerState.IsPickedUp) == 0 && mp.getPlayerSprite(player2).overlapsWith(mp.getPlayerSprite(value)))) {
                                pickUpPlayer(player2, value)
                                break;
                            }
                        }
                    }
                } else {
                    throwPlayer(player2, mp.getPlayerState(player2, MultiplayerState.IsHoldingPlayer))
                }
            }
        }
    } else if (gameState == "character-select") {
        mp.setPlayerState(player2, MultiplayerState.LockedInCharacter, 0)
    }
})
function throwPlayer (picker: number, upper: number) {
    mp.setPlayerState(picker, MultiplayerState.IsHoldingPlayer, 0)
    markThrownBy(picker, upper)
    resetPlayerAfterHeld(upper, false)
    if (platformer.hasState(platformer.asPlatformerSprite(mp.getPlayerSprite(picker)), platformer.PlatformerSpriteState.FacingLeft)) {
        mp.getPlayerSprite(upper).vx = 0 - throwSpeed
    } else {
        mp.getPlayerSprite(upper).vx = throwSpeed
    }
    tempNumber = mp.getPlayerSprite(picker).bottom
    mp.getPlayerSprite(picker).setImage(img`
        3 3 3 3 3 
        3 3 3 3 3 
        3 3 3 3 3 
        3 3 3 3 3 
        3 3 3 3 3 
        3 3 3 3 3 
        3 3 3 3 3 
        3 3 3 3 3 
        `)
    mp.getPlayerSprite(picker).bottom = tempNumber
}
scene.onHitWall(SpriteKind.Player, function (sprite, location) {
    if (tiles.tileAtLocationEquals(location, assets.tile`myTile7`) && sprite.bottom <= location.top) {
        sprites.setDataNumber(sprite, "conveyorVelocityNextFrame", 0 - conveyorSpeed)
    } else if (tiles.tileAtLocationEquals(location, assets.tile`myTile6`) && sprite.bottom <= location.top) {
        sprites.setDataNumber(sprite, "conveyorVelocityNextFrame", conveyorSpeed)
    } else if (tiles.tileAtLocationEquals(location, assets.tile`myTile12`)) {
        tiles.setTileAt(location, assets.tile`transparency8`)
        tempSprite = sprites.create(assets.tile`myTile12`, SpriteKind.FallingBlock)
        tiles.placeOnTile(tempSprite, location)
        animation.runMovementAnimation(
        tempSprite,
        "v 1 h 1 v -1 h -1",
        100,
        true
        )
        tempSprite.lifespan = fallingBlockDelay
    } else {
    	
    }
})
function pickUpPlayer (picker: number, upper: number) {
    if (mp.getPlayerState(upper, MultiplayerState.InvincibleEndTime) > game.runtime()) {
        return
    }
    mp.setPlayerState(picker, MultiplayerState.IsHoldingPlayer, upper)
    mp.setPlayerState(upper, MultiplayerState.IsPickedUp, picker)
    if (!(checkPickupLegal(picker))) {
        mp.setPlayerState(picker, MultiplayerState.IsHoldingPlayer, 0)
        mp.setPlayerState(upper, MultiplayerState.IsPickedUp, 0)
        return
    }
    numberPlayersHeld = countHeldPlayers(picker)
    setControlsEnabled(upper, false)
    platformer.setCharacterAnimationsEnabled(platformer.asPlatformerSprite(mp.getPlayerSprite(upper)), false)
    mp.getPlayerSprite(upper).setImage(blockObject.getImageProperty(blockObject.getStoredObject(mp.getPlayerSprite(upper)), ImageProp.Sideways))
    tempNumber = mp.getPlayerSprite(picker).bottom
    mp.getPlayerSprite(picker).setImage(image.create(5, 8 + numberPlayersHeld * 5))
    mp.getPlayerSprite(picker).image.fill(1)
    mp.getPlayerSprite(picker).bottom = tempNumber
}
info.onCountdownEnd(function () {
    endRound()
})
scene.onOverlapTile(SpriteKind.Player, assets.tile`myTile9`, function (sprite, location) {
    if (sprite.top < location.bottom - 4) {
        respawnCharacter(mp.indexToPlayer(players.indexOf(sprite)))
    }
})
function startPlaying () {
    gameMode = "race"
    KOLog = []
    sprites.destroyAllSpritesOfKind(SpriteKind.CameraSprite)
    sprites.destroyAllSpritesOfKind(SpriteKind.CharacterSelect)
    sprites.destroyAllSpritesOfKind(SpriteKind.Text)
    p1 = createCharacter(mp.getPlayerState(mp.PlayerNumber.One, MultiplayerState.SelectedCharacter))
    p2 = createCharacter(mp.getPlayerState(mp.PlayerNumber.Two, MultiplayerState.SelectedCharacter))
    p3 = createCharacter(mp.getPlayerState(mp.PlayerNumber.Three, MultiplayerState.SelectedCharacter))
    p4 = createCharacter(mp.getPlayerState(mp.PlayerNumber.Four, MultiplayerState.SelectedCharacter))
    players = [
    p1,
    p2,
    p3,
    p4
    ]
    scene.setBackgroundColor(15)
    tiles.setCurrentTilemap(tileUtil.createSmallMap(tilemap`level6`))
    for (let value2 of mp.allPlayers()) {
        mp.setPlayerSprite(value2, players[mp.playerToIndex(value2)])
        setControlsEnabled(value2, true)
        mp.setPlayerState(value2, MultiplayerState.Stock, startingStockLives)
    }
    camera = sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . 3 . . . . . . . . 
        . . . . . . 3 3 3 . . . . . . . 
        . . . . . 3 3 3 3 3 . . . . . . 
        . . . . 3 3 3 3 3 3 3 . . . . . 
        . . . . 3 3 3 3 3 3 3 . . . . . 
        . . . . . 3 3 3 3 3 . . . . . . 
        . . . . . . 3 3 3 . . . . . . . 
        . . . . . . . 3 . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.CameraSprite)
    cameraTarget = sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . 7 . . . . . . . . 
        . . . . . . 7 7 7 . . . . . . . 
        . . . . . 7 7 7 7 7 . . . . . . 
        . . . . 7 7 7 7 7 7 7 . . . . . 
        . . . . 7 7 7 7 7 7 7 . . . . . 
        . . . . . 7 7 7 7 7 . . . . . . 
        . . . . . . 7 7 7 . . . . . . . 
        . . . . . . . 7 . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.CameraSprite)
    cameraWaypoints = [
    assets.tile`myTile1`,
    assets.tile`myTile2`,
    assets.tile`myTile3`,
    assets.tile`myTile4`,
    assets.tile`myTile16`,
    assets.tile`myTile17`,
    assets.tile`myTile18`,
    assets.tile`myTile19`
    ]
    tiles.placeOnRandomTile(camera, cameraWaypoints[0])
    tiles.placeOnRandomTile(cameraTarget, assets.tile`myTile11`)
    tiles.placeOnRandomTile(cameraTarget, cameraWaypoints[1])
    scene.centerCameraAt(camera.x, camera.y)
    scene.cameraFollowSprite(camera)
    camera.setFlag(SpriteFlag.Ghost, true)
    camera.setFlag(SpriteFlag.Invisible, true)
    cameraTarget.setFlag(SpriteFlag.Ghost, true)
    cameraTarget.setFlag(SpriteFlag.Invisible, true)
    pause(0)
    turnOnWalls(assets.tile`myTile`)
    turnOnWalls(assets.tile`myTile6`)
    turnOnWalls(assets.tile`myTile7`)
    turnOnWalls(assets.tile`myTile12`)
    for (let value of mp.allPlayers()) {
        mp.setPlayerState(value, MultiplayerState.DeathsThisRound, 0)
        mp.setPlayerState(value, MultiplayerState.SelfKOs, 0)
        if (gameMode != "race") {
            mp.getPlayerSprite(value).x = scene.cameraProperty(CameraProperty.Left) + (20 + 40 * mp.playerToIndex(value))
        } else {
            mp.getPlayerSprite(value).x = scene.cameraProperty(CameraProperty.Left) + (30 + 6 * mp.playerToIndex(value))
        }
        mp.getPlayerSprite(value).top = scene.cameraProperty(CameraProperty.Top) + 20
    }
    for (let value of cameraWaypoints) {
        tileUtil.coverAllTiles(value, assets.tile`myTile5`)
    }
    for (let value of tiles.getTilesByType(assets.tile`myTile11`)) {
        tileUtil.coverTile(value, assets.tile`myTile20`)
        tempLocation = value.getNeighboringLocation(CollisionDirection.Top)
        while (tiles.tileAtLocationEquals(tempLocation, assets.tile`transparency8`)) {
            tiles.setTileAt(tempLocation, assets.tile`myTile20`)
            tempLocation = tempLocation.getNeighboringLocation(CollisionDirection.Top)
        }
        tempLocation = value.getNeighboringLocation(CollisionDirection.Bottom)
        while (tiles.tileAtLocationEquals(tempLocation, assets.tile`transparency8`)) {
            tiles.setTileAt(tempLocation, assets.tile`myTile20`)
            tempLocation = tempLocation.getNeighboringLocation(CollisionDirection.Bottom)
        }
    }
    for (let value of tiles.getTilesByType(assets.tile`myTile7`)) {
        tempSprite = sprites.create(img`
            . . . . . . . . 
            . . . . . . . . 
            . . . . . . . . 
            . . . . . . . . 
            . . . . . . . . 
            . . . . . . . . 
            . . . . . . . . 
            . . . . . . . . 
            `, SpriteKind.Decoration)
        tiles.placeOnTile(tempSprite, value)
        if (!(tiles.tileAtLocationEquals(value.getNeighboringLocation(CollisionDirection.Left), assets.tile`myTile7`))) {
            animation.runImageAnimation(
            tempSprite,
            assets.animation`myAnim0`,
            100,
            true
            )
        } else if (!(tiles.tileAtLocationEquals(value.getNeighboringLocation(CollisionDirection.Right), assets.tile`myTile7`))) {
            animation.runImageAnimation(
            tempSprite,
            assets.animation`myAnim1`,
            100,
            true
            )
        } else {
            animation.runImageAnimation(
            tempSprite,
            assets.animation`myAnim`,
            100,
            true
            )
        }
    }
    for (let value of tiles.getTilesByType(assets.tile`myTile6`)) {
        tempSprite = sprites.create(img`
            . . . . . . . . 
            . . . . . . . . 
            . . . . . . . . 
            . . . . . . . . 
            . . . . . . . . 
            . . . . . . . . 
            . . . . . . . . 
            . . . . . . . . 
            `, SpriteKind.Decoration)
        tiles.placeOnTile(tempSprite, value)
        if (!(tiles.tileAtLocationEquals(value.getNeighboringLocation(CollisionDirection.Left), assets.tile`myTile6`))) {
            animation.runImageAnimation(
            tempSprite,
            assets.animation`myAnim4`,
            100,
            true
            )
        } else if (!(tiles.tileAtLocationEquals(value.getNeighboringLocation(CollisionDirection.Right), assets.tile`myTile6`))) {
            animation.runImageAnimation(
            tempSprite,
            assets.animation`myAnim3`,
            100,
            true
            )
        } else {
            animation.runImageAnimation(
            tempSprite,
            assets.animation`myAnim2`,
            100,
            true
            )
        }
    }
    camera.follow(cameraTarget, cameraSpeed)
    if (gameMode == "timed") {
        info.startCountdown(matchTime)
    }
    gameState = "playing"
}
function isCharacterTaken (templateIndex: number, playerToIgnore: number) {
    for (let value of mp.allPlayers()) {
        if (value == playerToIgnore) {
            continue;
        }
        if (mp.getPlayerState(value, MultiplayerState.SelectedCharacter) == templateIndex) {
            return true
        }
    }
    return false
}
function flipAnimation (anim: Image[]) {
    tempImageArray = []
    for (let value of anim) {
        tempImageArray.push(value.clone())
    }
    for (let value of tempImageArray) {
        value.flipX()
    }
    return tempImageArray
}
scene.onOverlapTile(SpriteKind.Player, assets.tile`myTile20`, function (sprite, location) {
    if (gameMode == "race") {
    	
    }
})
function createCharacters () {
    characterTemplates = [
    blockObject.create(),
    blockObject.create(),
    blockObject.create(),
    blockObject.create(),
    blockObject.create(),
    blockObject.create(),
    blockObject.create(),
    blockObject.create(),
    blockObject.create(),
    blockObject.create()
    ]
    if (true) {
        blockObject.setImageArrayProperty(characterTemplates[0], ImageArrayProp.WalkingRight, assets.animation`p1-walking-right`)
        blockObject.setImageArrayProperty(characterTemplates[0], ImageArrayProp.IdleRight, assets.animation`p1-idle-right`)
        blockObject.setImageProperty(characterTemplates[0], ImageProp.Sideways, img`
            . b b . . . . . 
            . b b 2 1 2 2 2 
            . . b 2 2 2 2 . 
            . . b 2 1 2 2 . 
            . . b 2 2 2 2 2 
            `)
        blockObject.setStringProperty(characterTemplates[0], StrProp.Name, "ONE")
        blockObject.setNumberProperty(characterTemplates[0], NumProp.IdleInterval, 100)
        blockObject.setNumberProperty(characterTemplates[0], NumProp.WalkingInterval, 75)
    }
    if (true) {
        blockObject.setImageArrayProperty(characterTemplates[1], ImageArrayProp.WalkingRight, assets.animation`p2-walking-right`)
        blockObject.setImageArrayProperty(characterTemplates[1], ImageArrayProp.IdleRight, assets.animation`p2-idle-right`)
        blockObject.setImageProperty(characterTemplates[1], ImageProp.Sideways, img`
            . . a . . . . . 
            . 3 a 8 1 8 c c 
            . 3 a 8 8 8 c . 
            . a a 8 1 8 c . 
            . a a 8 8 8 c c 
            `)
        blockObject.setStringProperty(characterTemplates[1], StrProp.Name, "TWO")
        blockObject.setNumberProperty(characterTemplates[1], NumProp.IdleInterval, 100)
        blockObject.setNumberProperty(characterTemplates[1], NumProp.WalkingInterval, 75)
    }
    if (true) {
        blockObject.setImageArrayProperty(characterTemplates[2], ImageArrayProp.WalkingRight, assets.animation`p3-walking-right`)
        blockObject.setImageArrayProperty(characterTemplates[2], ImageArrayProp.IdleRight, assets.animation`p3-idle-right`)
        blockObject.setImageProperty(characterTemplates[2], ImageProp.Sideways, img`
            . e e 4 1 4 6 b 
            . e e 4 4 4 6 . 
            . e e 4 1 4 6 . 
            . e e 4 4 4 6 b 
            . . e e e . . . 
            `)
        blockObject.setStringProperty(characterTemplates[2], StrProp.Name, "THREE")
        blockObject.setNumberProperty(characterTemplates[2], NumProp.IdleInterval, 100)
        blockObject.setNumberProperty(characterTemplates[2], NumProp.WalkingInterval, 75)
    }
    if (true) {
        blockObject.setImageArrayProperty(characterTemplates[3], ImageArrayProp.WalkingRight, assets.animation`turnip`)
        blockObject.setImageArrayProperty(characterTemplates[3], ImageArrayProp.IdleRight, assets.animation`turnip`)
        blockObject.setImageProperty(characterTemplates[3], ImageProp.Sideways, img`
            . . . 3 d d . . 
            6 . b 3 d d d . 
            . 6 b 3 d d d d 
            6 . b 3 d d d . 
            . . . 3 d d . . 
            `)
        blockObject.setStringProperty(characterTemplates[3], StrProp.Name, "TURNIP")
        blockObject.setNumberProperty(characterTemplates[3], NumProp.IdleInterval, 75)
        blockObject.setNumberProperty(characterTemplates[3], NumProp.WalkingInterval, 75)
    }
    if (true) {
        blockObject.setImageArrayProperty(characterTemplates[4], ImageArrayProp.WalkingRight, assets.animation`auto-walking-right`)
        blockObject.setImageArrayProperty(characterTemplates[4], ImageArrayProp.IdleRight, assets.animation`auto-idle-right`)
        blockObject.setImageProperty(characterTemplates[4], ImageProp.Sideways, img`
            . . c 5 c . . . 
            . c c c c c c c 
            . . c 5 c c c . 
            . c c c c c c c 
            . . c c c . c . 
            `)
        blockObject.setStringProperty(characterTemplates[4], StrProp.Name, "AUTO")
        blockObject.setNumberProperty(characterTemplates[4], NumProp.IdleInterval, 100)
        blockObject.setNumberProperty(characterTemplates[4], NumProp.WalkingInterval, 100)
    }
    if (true) {
        blockObject.setImageArrayProperty(characterTemplates[5], ImageArrayProp.WalkingRight, assets.animation`croc-walking-right`)
        blockObject.setImageArrayProperty(characterTemplates[5], ImageArrayProp.IdleRight, assets.animation`croc-idle-right`)
        blockObject.setImageProperty(characterTemplates[5], ImageProp.Sideways, img`
            . . 7 7 . . . . 
            . . 7 7 . . . . 
            . 6 7 7 4 5 7 . 
            . 7 f 7 4 5 . . 
            . 7 7 7 7 7 7 . 
            `)
        blockObject.setStringProperty(characterTemplates[5], StrProp.Name, "CROC")
        blockObject.setNumberProperty(characterTemplates[5], NumProp.IdleInterval, 100)
        blockObject.setNumberProperty(characterTemplates[5], NumProp.WalkingInterval, 100)
    }
    if (true) {
        blockObject.setImageArrayProperty(characterTemplates[6], ImageArrayProp.WalkingRight, assets.animation`bun-walking-right`)
        blockObject.setImageArrayProperty(characterTemplates[6], ImageArrayProp.IdleRight, assets.animation`bun-idle-right`)
        blockObject.setImageProperty(characterTemplates[6], ImageProp.Sideways, img`
            . . 1 f 1 . . . 
            b b 1 1 1 1 1 . 
            3 3 1 f 1 1 . . 
            1 1 1 1 1 1 1 . 
            . . 1 1 1 . . . 
            `)
        blockObject.setStringProperty(characterTemplates[6], StrProp.Name, "BUN")
        blockObject.setNumberProperty(characterTemplates[6], NumProp.IdleInterval, 100)
        blockObject.setNumberProperty(characterTemplates[6], NumProp.WalkingInterval, 50)
    }
    if (true) {
        blockObject.setImageArrayProperty(characterTemplates[7], ImageArrayProp.WalkingRight, assets.animation`robot-walking-right`)
        blockObject.setImageArrayProperty(characterTemplates[7], ImageArrayProp.IdleRight, assets.animation`robot-idle-right`)
        blockObject.setImageProperty(characterTemplates[7], ImageProp.Sideways, img`
            . . 6 c 6 . . . 
            . . 6 6 6 8 6 6 
            9 6 6 c 6 8 6 . 
            . . 6 6 6 8 6 6 
            . . b b b . . . 
            `)
        blockObject.setStringProperty(characterTemplates[7], StrProp.Name, "ROBOT")
        blockObject.setNumberProperty(characterTemplates[7], NumProp.IdleInterval, 100)
        blockObject.setNumberProperty(characterTemplates[7], NumProp.WalkingInterval, 75)
    }
    if (true) {
        blockObject.setImageArrayProperty(characterTemplates[8], ImageArrayProp.WalkingRight, assets.animation`cy-walking-right`)
        blockObject.setImageArrayProperty(characterTemplates[8], ImageArrayProp.IdleRight, assets.animation`cy-idle-right`)
        blockObject.setImageProperty(characterTemplates[8], ImageProp.Sideways, img`
            . b 1 f 1 b a e 
            d b 1 1 1 b a . 
            d b b b b b 6 . 
            . d d d d b 6 e 
            . . d d d . . . 
            `)
        blockObject.setStringProperty(characterTemplates[8], StrProp.Name, "CY")
        blockObject.setNumberProperty(characterTemplates[8], NumProp.IdleInterval, 100)
        blockObject.setNumberProperty(characterTemplates[8], NumProp.WalkingInterval, 75)
    }
    if (true) {
        blockObject.setImageArrayProperty(characterTemplates[9], ImageArrayProp.WalkingRight, assets.animation`breakfast-walking-right`)
        blockObject.setImageArrayProperty(characterTemplates[9], ImageArrayProp.IdleRight, assets.animation`breakfast-idle-right`)
        blockObject.setImageProperty(characterTemplates[9], ImageProp.Sideways, img`
            . . . . c 5 c . . 
            . . . c c c c c c 
            . . . . c 5 c c . 
            . . . c c c c c c 
            . . . . . . . c . 
            . . . . . . c . . 
            `)
        blockObject.setStringProperty(characterTemplates[9], StrProp.Name, "B.F.")
        blockObject.setNumberProperty(characterTemplates[9], NumProp.IdleInterval, 100)
        blockObject.setNumberProperty(characterTemplates[9], NumProp.WalkingInterval, 75)
    }
}
function showMainMenu () {
    myMenu = miniMenu.createMenu(
    miniMenu.createMenuItem("Race"),
    miniMenu.createMenuItem("Battle"),
    miniMenu.createMenuItem("Autoscroller")
    )
    myMenu.onButtonPressed(controller.A, function (selection, selectedIndex) {
    	
    })
}
function setControlsEnabled (player2: number, enabled: boolean) {
    if (player2 == 1) {
        platformer.moveSprite(p1, enabled, moveSpeed, controller.player1)
    } else if (player2 == 2) {
        platformer.moveSprite(p2, enabled, moveSpeed, controller.player2)
    } else if (player2 == 3) {
        platformer.moveSprite(p3, enabled, moveSpeed, controller.player3)
    } else {
        platformer.moveSprite(p4, enabled, moveSpeed, controller.player4)
    }
}
function moveToNextWaypoint () {
    if (tiles.tileAtLocationEquals(cameraTarget.tilemapLocation(), assets.tile`myTile11`)) {
        if (gameMode != "race") {
            endRound()
        }
    } else {
        for (let index = 0; index <= cameraWaypoints.length - 1; index++) {
            if (tiles.tileImageAtLocation(cameraTarget.tilemapLocation()).equals(cameraWaypoints[index])) {
                if (tiles.getTilesByType(cameraWaypoints[index + 1]).length == 0) {
                    if (tiles.getTilesByType(assets.tile`myTile11`).length == 0) {
                        tiles.placeOnRandomTile(cameraTarget, cameraWaypoints[0])
                    } else {
                        tiles.placeOnRandomTile(cameraTarget, assets.tile`myTile11`)
                    }
                } else {
                    tiles.placeOnRandomTile(cameraTarget, cameraWaypoints[index + 1])
                }
                cameraTarget.x += 3
                break;
            }
        }
        camera.follow(cameraTarget, 0)
        timer.after(waypointDelayTime, function () {
            camera.follow(cameraTarget, cameraSpeed)
        })
    }
}
scene.onOverlapTile(SpriteKind.Player, assets.tile`myTile8`, function (sprite, location) {
    if (sprite.right > location.left + 4) {
        respawnCharacter(mp.indexToPlayer(players.indexOf(sprite)))
    }
})
function respawnCharacter (player2: number) {
    if (mp.getPlayerState(player2, MultiplayerState.IsWaitingToRespawn) != 0) {
        return
    }
    if (mp.getPlayerState(player2, MultiplayerState.InvincibleEndTime) > game.runtime()) {
        return
    }
    if (mp.getPlayerState(player2, MultiplayerState.IsHoldingPlayer) != 0) {
        resetPlayerAfterHeld(mp.getPlayerState(player2, MultiplayerState.IsHoldingPlayer), true)
    }
    mp.changePlayerStateBy(player2, MultiplayerState.DeathsThisRound, 1)
    mp.setPlayerState(player2, MultiplayerState.IsHoldingPlayer, 0)
    mp.setPlayerState(player2, MultiplayerState.IsWaitingToRespawn, 1)
    if (game.runtime() < mp.getPlayerState(player2, MultiplayerState.ThrowByEndTime)) {
        KOLog.push([mp.getPlayerState(player2, MultiplayerState.ThrownBy), player2, game.runtime()])
    } else {
        KOLog.push([player2, player2, game.runtime()])
        mp.changePlayerStateBy(player2, MultiplayerState.SelfKOs, 1)
    }
    setControlsEnabled(player2, false)
    platformer.setCharacterAnimationsEnabled(platformer.asPlatformerSprite(mp.getPlayerSprite(player2)), false)
    mp.getPlayerSprite(player2).setFlag(SpriteFlag.Invisible, true)
    mp.getPlayerSprite(player2).setFlag(SpriteFlag.Ghost, true)
    mp.setPlayerState(player2, MultiplayerState.IsRespawnReadyToDrop, 0)
    if (gameMode == "race") {
        mp.changePlayerStateBy(player2, MultiplayerState.Stock, -1)
        if (mp.getPlayerState(player2, MultiplayerState.Stock) == 0) {
            mp.setPlayerState(player2, MultiplayerState.LostLastStockTime, game.runtime())
            tempNumber = 0
            for (let value of mp.allPlayers()) {
                if (mp.getPlayerState(value, MultiplayerState.Stock) != 0) {
                    tempNumber += 1
                }
            }
            if (tempNumber == 1) {
                endRound()
            }
        }
    }
    scene.cameraShake(2, 100)
    music.smallCrash.play()
    if (gameMode != "race" || mp.getPlayerState(player2, MultiplayerState.Stock) != 0) {
        timer.after(respawnTime, function () {
            mp.setPlayerState(player2, MultiplayerState.IsRespawnReadyToDrop, 1)
            mp.setPlayerState(player2, MultiplayerState.RespawnTimer, game.runtime() + respawnHangTime)
        })
    }
}
mp.onButtonEvent(mp.MultiplayerButton.Left, ControllerButtonEvent.Pressed, function (player2) {
    if (gameState == "character-select") {
        changeCharacterSelect(player2, true)
    }
})
function endRound () {
    gameState = "end"
    sprites.destroyAllSpritesOfKind(SpriteKind.CameraSprite)
    sprites.destroyAllSpritesOfKind(SpriteKind.Player)
    characterSelectText = []
    for (let value of mp.allPlayers()) {
        if (mp.getPlayerState(value, MultiplayerState.Joined) != 0) {
            characterSelectText.push(textsprite.create(blockObject.getStringProperty(blockObject.getStoredObject(mp.getPlayerSprite(value)), StrProp.Name)))
            characterSelectText[characterSelectText.length - 1].setOutline(2, 10)
            characterSelectText[characterSelectText.length - 1].setPosition(21 + 39 * (value - 1), 107)
            characterSelectText[characterSelectText.length - 1].z = 200
            characterSelectText[characterSelectText.length - 1].setFlag(SpriteFlag.RelativeToCamera, true)
        } else {
            characterSelectText.push(textsprite.create(""))
        }
    }
    scores = [
    0,
    0,
    0,
    0
    ]
    if (gameMode == "race") {
        if (true) {
        	
        }
    } else {
        for (let value of KOLog) {
            if (value[0] == value[1]) {
                scores[mp.playerToIndex(value[0])] = scores[mp.playerToIndex(value[0])] - 1
            } else {
                scores[mp.playerToIndex(value[0])] = scores[mp.playerToIndex(value[0])] + 1
                scores[mp.playerToIndex(value[1])] = scores[mp.playerToIndex(value[1])] - 1
            }
        }
    }
    tempNumber = -9999999
    for (let value of scores) {
        tempNumber = Math.max(tempNumber, value)
    }
    winners = []
    for (let value of mp.allPlayers()) {
        if (mp.getPlayerState(value, MultiplayerState.Joined) != 0) {
            if (scores[mp.playerToIndex(value)] == tempNumber) {
                winners.push(value)
                characterSelectText[mp.playerToIndex(value)].destroy()
            } else {
                characterSelectText[mp.playerToIndex(value)].setOutline(0, 10)
                characterSelectText[mp.playerToIndex(value)].setPosition(21 + 39 * (value - 1), 109)
            }
        }
    }
}
function startCharacterSelect () {
    gameState = "character-select"
    mp.setPlayerState(mp.PlayerNumber.One, MultiplayerState.SelectedCharacter, 0)
    mp.setPlayerState(mp.PlayerNumber.One, MultiplayerState.LockedInCharacter, 0)
    mp.setPlayerState(mp.PlayerNumber.One, MultiplayerState.Joined, 1)
    mp.setPlayerState(mp.PlayerNumber.Two, MultiplayerState.SelectedCharacter, 1)
    mp.setPlayerState(mp.PlayerNumber.Two, MultiplayerState.LockedInCharacter, 0)
    if (debug) {
        mp.setPlayerState(mp.PlayerNumber.Two, MultiplayerState.Joined, 1)
    } else {
        mp.setPlayerState(mp.PlayerNumber.Two, MultiplayerState.Joined, 0)
    }
    mp.setPlayerState(mp.PlayerNumber.Three, MultiplayerState.SelectedCharacter, 2)
    if (debug) {
        mp.setPlayerState(mp.PlayerNumber.Three, MultiplayerState.Joined, 1)
    } else {
        mp.setPlayerState(mp.PlayerNumber.Three, MultiplayerState.Joined, 0)
    }
    mp.setPlayerState(mp.PlayerNumber.Three, MultiplayerState.LockedInCharacter, 0)
    mp.setPlayerState(mp.PlayerNumber.Four, MultiplayerState.SelectedCharacter, 3)
    mp.setPlayerState(mp.PlayerNumber.Four, MultiplayerState.LockedInCharacter, 0)
    if (debug) {
        mp.setPlayerState(mp.PlayerNumber.Four, MultiplayerState.Joined, 1)
    } else {
        mp.setPlayerState(mp.PlayerNumber.Four, MultiplayerState.Joined, 0)
    }
    characterSelectSprites = [
    sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.CharacterSelect),
    sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.CharacterSelect),
    sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.CharacterSelect),
    sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.CharacterSelect)
    ]
    characterSelectText = [
    textsprite.create(""),
    textsprite.create(""),
    textsprite.create(""),
    textsprite.create("")
    ]
    textSprite = textsprite.create("P1 PRESS MENU TO START")
    textSprite.setFlag(SpriteFlag.Invisible, true)
    textSprite.z = 10
    textSprite.setMaxFontHeight(8)
    textSprite.setOutline(2, 10)
    textSprite.x = 80
    textSprite.top = 103
    for (let value of characterSelectSprites) {
        value.z = 10
        value.scale = 5
    }
    for (let value of characterSelectText) {
        value.z = 10
    }
    for (let value of mp.allPlayers()) {
        changeCharacterSelect(value, true)
        changeCharacterSelect(value, false)
    }
}
function changeCharacterSelect (player2: number, left: boolean) {
    if (mp.getPlayerState(player2, MultiplayerState.LockedInCharacter) != 0) {
        return
    }
    if (left) {
        mp.setPlayerState(player2, MultiplayerState.SelectedCharacter, (mp.getPlayerState(player2, MultiplayerState.SelectedCharacter) + (characterTemplates.length - 1)) % characterTemplates.length)
        while (isCharacterTaken(mp.getPlayerState(player2, MultiplayerState.SelectedCharacter), player2)) {
            mp.setPlayerState(player2, MultiplayerState.SelectedCharacter, (mp.getPlayerState(player2, MultiplayerState.SelectedCharacter) + (characterTemplates.length - 1)) % characterTemplates.length)
        }
    } else {
        mp.setPlayerState(player2, MultiplayerState.SelectedCharacter, (mp.getPlayerState(player2, MultiplayerState.SelectedCharacter) + 1) % characterTemplates.length)
        while (isCharacterTaken(mp.getPlayerState(player2, MultiplayerState.SelectedCharacter), player2)) {
            mp.setPlayerState(player2, MultiplayerState.SelectedCharacter, (mp.getPlayerState(player2, MultiplayerState.SelectedCharacter) + 1) % characterTemplates.length)
        }
    }
    animation.runImageAnimation(
    characterSelectSprites[mp.playerToIndex(player2)],
    blockObject.getImageArrayProperty(characterTemplates[mp.getPlayerState(player2, MultiplayerState.SelectedCharacter)], ImageArrayProp.IdleRight),
    blockObject.getNumberProperty(characterTemplates[mp.getPlayerState(player2, MultiplayerState.SelectedCharacter)], NumProp.IdleInterval),
    true
    )
    characterSelectText[mp.playerToIndex(player2)].setText(blockObject.getStringProperty(characterTemplates[mp.getPlayerState(player2, MultiplayerState.SelectedCharacter)], StrProp.Name))
}
spriteutils.createRenderable(1, function (screen2) {
    if (gameState == "character-select") {
        screen2.fill(11)
        drawWavyRainbow(img`
            ....aaaaaaa...aa......aa......aaaa......aaaaaaaaa.......aaaa.........aaaaaaa...aaaaaaaaaa...aaaaaaaaaa...aaaaaaaaa..
            ..aaaaaaaaaa.aaaa....aaaa...aaaaaaaa...aaaaaaaaaaa....aaaaaaaa.....aaaaaaaaaa.aaaaaaaaaaaa.aaaaaaaaaaaa.aaaaaaaaaaa.
            .aaaaaaaaaaa.aaaa....aaaa..aaaaaaaaaa..aaaaaaaaaaaa..aaaaaaaaaa...aaaaaaaaaaa.aaaaaaaaaaaa.aaaaaaaaaaaa.aaaaaaaaaaaa
            .aaaaaaaaaa..aaaa....aaaa..aaaaaaaaaa..aaaaaaaaaaaa..aaaaaaaaaa...aaaaaaaaaa...aaaaaaaaaa..aaaaaaaaaaa..aaaaaaaaaaaa
            aaaaaa.......aaaa....aaaa.aaaaa..aaaaa.aaaa...aaaaa.aaaaa..aaaaa.aaaaaa...........aaaa.....aaaa.........aaaa...aaaaa
            aaaaa........aaaa....aaaa.aaaa....aaaa.aaaa....aaaa.aaaa....aaaa.aaaaa............aaaa.....aaaa.........aaaa....aaaa
            aaaa.........aaaaaaaaaaaa.aaaa....aaaa.aaaa....aaaa.aaaa....aaaa.aaaa.............aaaa.....aaaaaa.......aaaa....aaaa
            aaaa.........aaaaaaaaaaaa.aaaa....aaaa.aaaa...aaaaa.aaaa....aaaa.aaaa.............aaaa.....aaaaaaa......aaaa...aaaaa
            aaaa.........aaaaaaaaaaaa.aaaaaaaaaaaa.aaaaaaaaaaaa.aaaaaaaaaaaa.aaaa.............aaaa.....aaaaaaa......aaaaaaaaaaaa
            aaaa.........aaaaaaaaaaaa.aaaaaaaaaaaa.aaaaaaaaaaa..aaaaaaaaaaaa.aaaa.............aaaa.....aaaaaa.......aaaaaaaaaaa.
            aaaaa........aaaa....aaaa.aaaaaaaaaaaa.aaaaaaaaaa...aaaaaaaaaaaa.aaaaa............aaaa.....aaaa.........aaaaaaaaaa..
            aaaaaa.......aaaa....aaaa.aaaaaaaaaaaa.aaaaaaaaaaa..aaaaaaaaaaaa.aaaaaa...........aaaa.....aaaa.........aaaaaaaaaaa.
            .aaaaaaaaaa..aaaa....aaaa.aaaa....aaaa.aaaa..aaaaa..aaaa....aaaa..aaaaaaaaaa......aaaa.....aaaaaaaaaaa..aaaa..aaaaa.
            .aaaaaaaaaaa.aaaa....aaaa.aaaa....aaaa.aaaa..aaaaaa.aaaa....aaaa..aaaaaaaaaaa.....aaaa.....aaaaaaaaaaaa.aaaa..aaaaaa
            ..aaaaaaaaaa.aaaa....aaaa.aaaa....aaaa.aaaa...aaaaa.aaaa....aaaa...aaaaaaaaaa.....aaaa.....aaaaaaaaaaaa.aaaa...aaaaa
            ....aaaaaaa...aa......aa...aa......aa...aa.....aaa...aa......aa......aaaaaaa.......aa.......aaaaaaaaaa...aa.....aaa.
            ....................................................................................................................
            ........................aaaaaaa...aaaaaaaaaa...aa...........aaaaaaaaaa......aaaaaaa...aaaaaaaaaa....................
            ......................aaaaaaaaaa.aaaaaaaaaaaa.aaaa.........aaaaaaaaaaaa...aaaaaaaaaa.aaaaaaaaaaaa...................
            .....................aaaaaaaaaaa.aaaaaaaaaaaa.aaaa.........aaaaaaaaaaaa..aaaaaaaaaaa.aaaaaaaaaaaa...................
            .....................aaaaaaaaaa..aaaaaaaaaaa..aaaa.........aaaaaaaaaaa...aaaaaaaaaa...aaaaaaaaaa....................
            ....................aaaaaa.......aaaa.........aaaa.........aaaa.........aaaaaa...........aaaa.......................
            ....................aaaaa........aaaa.........aaaa.........aaaa.........aaaaa............aaaa.......................
            ....................aaaaaaaaaa...aaaaaa.......aaaa.........aaaaaa.......aaaa.............aaaa.......................
            ....................aaaaaaaaaaa..aaaaaaa......aaaa.........aaaaaaa......aaaa.............aaaa.......................
            .....................aaaaaaaaaaa.aaaaaaa......aaaa.........aaaaaaa......aaaa.............aaaa.......................
            ......................aaaaaaaaaa.aaaaaa.......aaaa.........aaaaaa.......aaaa.............aaaa.......................
            ...........................aaaaa.aaaa.........aaaa.........aaaa.........aaaaa............aaaa.......................
            ..........................aaaaaa.aaaa.........aaaa.........aaaa.........aaaaaa...........aaaa.......................
            .....................aaaaaaaaaa..aaaaaaaaaaa..aaaaaaaaaaa..aaaaaaaaaaa...aaaaaaaaaa......aaaa.......................
            ....................aaaaaaaaaaa..aaaaaaaaaaaa.aaaaaaaaaaaa.aaaaaaaaaaaa..aaaaaaaaaaa.....aaaa.......................
            ....................aaaaaaaaaa...aaaaaaaaaaaa.aaaaaaaaaaaa.aaaaaaaaaaaa...aaaaaaaaaa.....aaaa.......................
            .....................aaaaaaa......aaaaaaaaaa...aaaaaaaaaa...aaaaaaaaaa......aaaaaaa.......aa........................
            `, screen2)
        if (allPlayersAreLockedIn()) {
            drawWavyRainbowText(textSprite, screen2)
        }
        if (mp.getPlayerState(mp.PlayerNumber.One, MultiplayerState.LockedInCharacter) == 0) {
            screen2.fillRect(3, 40, 37, 61, 12)
        } else {
            screen2.fillRect(3, 40, 37, 61, 2)
        }
        if (mp.getPlayerState(mp.PlayerNumber.One, MultiplayerState.Joined) == 0) {
            if (Math.idiv(game.runtime(), 500) % 2 != 0) {
                spriteutils.drawTransparentImage(img`
                    ....................................
                    ....................................
                    ..bbbb...bbbb...bbbbb..bbbb...bbbb..
                    .bbbbbb.bbbbbb.bbbbbb.bbbbbb.bbbbbb.
                    .bb..bb.bb..bb.bb.....bb..bb.bb..bb.
                    .bb..bb.bb..bb.bbbb...bbb....bbb....
                    .bbbbbb.bbbbbb.bbbb....bbbb...bbbb..
                    .bbbbb..bbbbb..bb........bbb....bbb.
                    .bb.....bbbbbb.bbbbbb.bbbbbb.bbbbbb.
                    .bb.....bb.bbb..bbbbb.bbbbb..bbbbb..
                    ....................................
                    ....................................
                    ....................................
                    ................bb..................
                    ..............bbbbbb................
                    .............bbbbbbbb...............
                    .............bbbbbbbb...............
                    ............bbbb..bbbb..............
                    ............bbb....bbb..............
                    ............bbb....bbb..............
                    ............bbbbbbbbbb..............
                    ............bbbbbbbbbb..............
                    ............bbbbbbbbbb..............
                    ............bbbb..bbbb..............
                    ............bbbb..bbbb..............
                    .............bb....bb...............
                    ....................................
                    ....................................
                    ....................................
                    ..........bbbbbb..bbbbb.............
                    ..........bbbbbb.bbbbbbb............
                    ............bb...bbb.bbb............
                    ............bb...bb...bb............
                    ............bb...bb...bb............
                    ............bb...bbb.bbb............
                    ............bb...bbbbbbb............
                    ............bb....bbbbb.............
                    ....................................
                    ....................................
                    ...bbbbbb..bbbbb..bbbbbb..bbb...bb..
                    ...bbbbbb.bbbbbbb.bbbbbb.bbbb...bb..
                    .....bb...bbb.bbb...bb...bbbbb..bb..
                    .....bb...bb...bb...bb...bb.bb..bb..
                    .....bb...bb...bb...bb...bb..bb.bb..
                    ..bb.bb...bbb.bbb...bb...bb..bbbbb..
                    ..bbbbb...bbbbbbb.bbbbbb.bb...bbbb..
                    ...bbb.....bbbbb..bbbbbb.bb...bbb...
                    ....................................
                    ....................................
                    ....................................
                    `, screen2, 4, 45)
            } else {
                spriteutils.drawTransparentImage(img`
                    ....................................
                    ....................................
                    ..9999...9999...99999..9999...9999..
                    .999999.999999.999999.999999.999999.
                    .99..99.99..99.99.....99..99.99..99.
                    .99..99.99..99.9999...999....999....
                    .999999.999999.9999....9999...9999..
                    .99999..99999..99........999....999.
                    .99.....999999.999999.999999.999999.
                    .99.....99.999..99999.99999..99999..
                    ....................................
                    ....................................
                    ....................................
                    ................99..................
                    ..............999999................
                    .............99999999...............
                    .............99999999...............
                    ............9999..9999..............
                    ............999....999..............
                    ............999....999..............
                    ............9999999999..............
                    ............9999999999..............
                    ............9999999999..............
                    ............9999..9999..............
                    ............9999..9999..............
                    .............99....99...............
                    ....................................
                    ....................................
                    ....................................
                    ..........999999..99999.............
                    ..........999999.9999999............
                    ............99...999.999............
                    ............99...99...99............
                    ............99...99...99............
                    ............99...999.999............
                    ............99...9999999............
                    ............99....99999.............
                    ....................................
                    ....................................
                    ...999999..99999..999999..999...99..
                    ...999999.9999999.999999.9999...99..
                    .....99...999.999...99...99999..99..
                    .....99...99...99...99...99.99..99..
                    .....99...99...99...99...99..99.99..
                    ..99.99...999.999...99...99..99999..
                    ..99999...9999999.999999.99...9999..
                    ...999.....99999..999999.99...999...
                    ....................................
                    ....................................
                    ....................................
                    `, screen2, 4, 45)
            }
        } else {
            screen2.fillRect(5, 42, 33, 50, 15)
        }
        if (mp.getPlayerState(mp.PlayerNumber.Two, MultiplayerState.LockedInCharacter) == 0) {
            screen2.fillRect(42, 40, 37, 61, 12)
        } else {
            screen2.fillRect(42, 40, 37, 61, 8)
        }
        if (mp.getPlayerState(mp.PlayerNumber.Two, MultiplayerState.Joined) == 0) {
            if (Math.idiv(game.runtime(), 500) % 2 != 0) {
                spriteutils.drawTransparentImage(img`
                    ....................................
                    ....................................
                    ..bbbb...bbbb...bbbbb..bbbb...bbbb..
                    .bbbbbb.bbbbbb.bbbbbb.bbbbbb.bbbbbb.
                    .bb..bb.bb..bb.bb.....bb..bb.bb..bb.
                    .bb..bb.bb..bb.bbbb...bbb....bbb....
                    .bbbbbb.bbbbbb.bbbb....bbbb...bbbb..
                    .bbbbb..bbbbb..bb........bbb....bbb.
                    .bb.....bbbbbb.bbbbbb.bbbbbb.bbbbbb.
                    .bb.....bb.bbb..bbbbb.bbbbb..bbbbb..
                    ....................................
                    ....................................
                    ....................................
                    ................bb..................
                    ..............bbbbbb................
                    .............bbbbbbbb...............
                    .............bbbbbbbb...............
                    ............bbbb..bbbb..............
                    ............bbb....bbb..............
                    ............bbb....bbb..............
                    ............bbbbbbbbbb..............
                    ............bbbbbbbbbb..............
                    ............bbbbbbbbbb..............
                    ............bbbb..bbbb..............
                    ............bbbb..bbbb..............
                    .............bb....bb...............
                    ....................................
                    ....................................
                    ....................................
                    ..........bbbbbb..bbbbb.............
                    ..........bbbbbb.bbbbbbb............
                    ............bb...bbb.bbb............
                    ............bb...bb...bb............
                    ............bb...bb...bb............
                    ............bb...bbb.bbb............
                    ............bb...bbbbbbb............
                    ............bb....bbbbb.............
                    ....................................
                    ....................................
                    ...bbbbbb..bbbbb..bbbbbb..bbb...bb..
                    ...bbbbbb.bbbbbbb.bbbbbb.bbbb...bb..
                    .....bb...bbb.bbb...bb...bbbbb..bb..
                    .....bb...bb...bb...bb...bb.bb..bb..
                    .....bb...bb...bb...bb...bb..bb.bb..
                    ..bb.bb...bbb.bbb...bb...bb..bbbbb..
                    ..bbbbb...bbbbbbb.bbbbbb.bb...bbbb..
                    ...bbb.....bbbbb..bbbbbb.bb...bbb...
                    ....................................
                    ....................................
                    ....................................
                    `, screen2, 43, 45)
            } else {
                spriteutils.drawTransparentImage(img`
                    ....................................
                    ....................................
                    ..9999...9999...99999..9999...9999..
                    .999999.999999.999999.999999.999999.
                    .99..99.99..99.99.....99..99.99..99.
                    .99..99.99..99.9999...999....999....
                    .999999.999999.9999....9999...9999..
                    .99999..99999..99........999....999.
                    .99.....999999.999999.999999.999999.
                    .99.....99.999..99999.99999..99999..
                    ....................................
                    ....................................
                    ....................................
                    ................99..................
                    ..............999999................
                    .............99999999...............
                    .............99999999...............
                    ............9999..9999..............
                    ............999....999..............
                    ............999....999..............
                    ............9999999999..............
                    ............9999999999..............
                    ............9999999999..............
                    ............9999..9999..............
                    ............9999..9999..............
                    .............99....99...............
                    ....................................
                    ....................................
                    ....................................
                    ..........999999..99999.............
                    ..........999999.9999999............
                    ............99...999.999............
                    ............99...99...99............
                    ............99...99...99............
                    ............99...999.999............
                    ............99...9999999............
                    ............99....99999.............
                    ....................................
                    ....................................
                    ...999999..99999..999999..999...99..
                    ...999999.9999999.999999.9999...99..
                    .....99...999.999...99...99999..99..
                    .....99...99...99...99...99.99..99..
                    .....99...99...99...99...99..99.99..
                    ..99.99...999.999...99...99..99999..
                    ..99999...9999999.999999.99...9999..
                    ...999.....99999..999999.99...999...
                    ....................................
                    ....................................
                    ....................................
                    `, screen2, 43, 45)
            }
        } else {
            screen2.fillRect(44, 42, 33, 50, 15)
        }
        if (mp.getPlayerState(mp.PlayerNumber.Three, MultiplayerState.LockedInCharacter) == 0) {
            screen2.fillRect(81, 40, 37, 61, 12)
        } else {
            screen2.fillRect(81, 40, 37, 61, 4)
        }
        if (mp.getPlayerState(mp.PlayerNumber.Three, MultiplayerState.Joined) == 0) {
            if (Math.idiv(game.runtime(), 500) % 2 != 0) {
                spriteutils.drawTransparentImage(img`
                    ....................................
                    ....................................
                    ..bbbb...bbbb...bbbbb..bbbb...bbbb..
                    .bbbbbb.bbbbbb.bbbbbb.bbbbbb.bbbbbb.
                    .bb..bb.bb..bb.bb.....bb..bb.bb..bb.
                    .bb..bb.bb..bb.bbbb...bbb....bbb....
                    .bbbbbb.bbbbbb.bbbb....bbbb...bbbb..
                    .bbbbb..bbbbb..bb........bbb....bbb.
                    .bb.....bbbbbb.bbbbbb.bbbbbb.bbbbbb.
                    .bb.....bb.bbb..bbbbb.bbbbb..bbbbb..
                    ....................................
                    ....................................
                    ....................................
                    ................bb..................
                    ..............bbbbbb................
                    .............bbbbbbbb...............
                    .............bbbbbbbb...............
                    ............bbbb..bbbb..............
                    ............bbb....bbb..............
                    ............bbb....bbb..............
                    ............bbbbbbbbbb..............
                    ............bbbbbbbbbb..............
                    ............bbbbbbbbbb..............
                    ............bbbb..bbbb..............
                    ............bbbb..bbbb..............
                    .............bb....bb...............
                    ....................................
                    ....................................
                    ....................................
                    ..........bbbbbb..bbbbb.............
                    ..........bbbbbb.bbbbbbb............
                    ............bb...bbb.bbb............
                    ............bb...bb...bb............
                    ............bb...bb...bb............
                    ............bb...bbb.bbb............
                    ............bb...bbbbbbb............
                    ............bb....bbbbb.............
                    ....................................
                    ....................................
                    ...bbbbbb..bbbbb..bbbbbb..bbb...bb..
                    ...bbbbbb.bbbbbbb.bbbbbb.bbbb...bb..
                    .....bb...bbb.bbb...bb...bbbbb..bb..
                    .....bb...bb...bb...bb...bb.bb..bb..
                    .....bb...bb...bb...bb...bb..bb.bb..
                    ..bb.bb...bbb.bbb...bb...bb..bbbbb..
                    ..bbbbb...bbbbbbb.bbbbbb.bb...bbbb..
                    ...bbb.....bbbbb..bbbbbb.bb...bbb...
                    ....................................
                    ....................................
                    ....................................
                    `, screen2, 82, 45)
            } else {
                spriteutils.drawTransparentImage(img`
                    ....................................
                    ....................................
                    ..9999...9999...99999..9999...9999..
                    .999999.999999.999999.999999.999999.
                    .99..99.99..99.99.....99..99.99..99.
                    .99..99.99..99.9999...999....999....
                    .999999.999999.9999....9999...9999..
                    .99999..99999..99........999....999.
                    .99.....999999.999999.999999.999999.
                    .99.....99.999..99999.99999..99999..
                    ....................................
                    ....................................
                    ....................................
                    ................99..................
                    ..............999999................
                    .............99999999...............
                    .............99999999...............
                    ............9999..9999..............
                    ............999....999..............
                    ............999....999..............
                    ............9999999999..............
                    ............9999999999..............
                    ............9999999999..............
                    ............9999..9999..............
                    ............9999..9999..............
                    .............99....99...............
                    ....................................
                    ....................................
                    ....................................
                    ..........999999..99999.............
                    ..........999999.9999999............
                    ............99...999.999............
                    ............99...99...99............
                    ............99...99...99............
                    ............99...999.999............
                    ............99...9999999............
                    ............99....99999.............
                    ....................................
                    ....................................
                    ...999999..99999..999999..999...99..
                    ...999999.9999999.999999.9999...99..
                    .....99...999.999...99...99999..99..
                    .....99...99...99...99...99.99..99..
                    .....99...99...99...99...99..99.99..
                    ..99.99...999.999...99...99..99999..
                    ..99999...9999999.999999.99...9999..
                    ...999.....99999..999999.99...999...
                    ....................................
                    ....................................
                    ....................................
                    `, screen2, 82, 45)
            }
        } else {
            screen2.fillRect(83, 42, 33, 50, 15)
        }
        if (mp.getPlayerState(mp.PlayerNumber.Four, MultiplayerState.LockedInCharacter) == 0) {
            screen2.fillRect(120, 40, 37, 61, 12)
        } else {
            screen2.fillRect(120, 40, 37, 61, 6)
        }
        if (mp.getPlayerState(mp.PlayerNumber.Four, MultiplayerState.Joined) == 0) {
            if (Math.idiv(game.runtime(), 500) % 2 != 0) {
                spriteutils.drawTransparentImage(img`
                    ....................................
                    ....................................
                    ..bbbb...bbbb...bbbbb..bbbb...bbbb..
                    .bbbbbb.bbbbbb.bbbbbb.bbbbbb.bbbbbb.
                    .bb..bb.bb..bb.bb.....bb..bb.bb..bb.
                    .bb..bb.bb..bb.bbbb...bbb....bbb....
                    .bbbbbb.bbbbbb.bbbb....bbbb...bbbb..
                    .bbbbb..bbbbb..bb........bbb....bbb.
                    .bb.....bbbbbb.bbbbbb.bbbbbb.bbbbbb.
                    .bb.....bb.bbb..bbbbb.bbbbb..bbbbb..
                    ....................................
                    ....................................
                    ....................................
                    ................bb..................
                    ..............bbbbbb................
                    .............bbbbbbbb...............
                    .............bbbbbbbb...............
                    ............bbbb..bbbb..............
                    ............bbb....bbb..............
                    ............bbb....bbb..............
                    ............bbbbbbbbbb..............
                    ............bbbbbbbbbb..............
                    ............bbbbbbbbbb..............
                    ............bbbb..bbbb..............
                    ............bbbb..bbbb..............
                    .............bb....bb...............
                    ....................................
                    ....................................
                    ....................................
                    ..........bbbbbb..bbbbb.............
                    ..........bbbbbb.bbbbbbb............
                    ............bb...bbb.bbb............
                    ............bb...bb...bb............
                    ............bb...bb...bb............
                    ............bb...bbb.bbb............
                    ............bb...bbbbbbb............
                    ............bb....bbbbb.............
                    ....................................
                    ....................................
                    ...bbbbbb..bbbbb..bbbbbb..bbb...bb..
                    ...bbbbbb.bbbbbbb.bbbbbb.bbbb...bb..
                    .....bb...bbb.bbb...bb...bbbbb..bb..
                    .....bb...bb...bb...bb...bb.bb..bb..
                    .....bb...bb...bb...bb...bb..bb.bb..
                    ..bb.bb...bbb.bbb...bb...bb..bbbbb..
                    ..bbbbb...bbbbbbb.bbbbbb.bb...bbbb..
                    ...bbb.....bbbbb..bbbbbb.bb...bbb...
                    ....................................
                    ....................................
                    ....................................
                    `, screen2, 121, 45)
            } else {
                spriteutils.drawTransparentImage(img`
                    ....................................
                    ....................................
                    ..9999...9999...99999..9999...9999..
                    .999999.999999.999999.999999.999999.
                    .99..99.99..99.99.....99..99.99..99.
                    .99..99.99..99.9999...999....999....
                    .999999.999999.9999....9999...9999..
                    .99999..99999..99........999....999.
                    .99.....999999.999999.999999.999999.
                    .99.....99.999..99999.99999..99999..
                    ....................................
                    ....................................
                    ....................................
                    ................99..................
                    ..............999999................
                    .............99999999...............
                    .............99999999...............
                    ............9999..9999..............
                    ............999....999..............
                    ............999....999..............
                    ............9999999999..............
                    ............9999999999..............
                    ............9999999999..............
                    ............9999..9999..............
                    ............9999..9999..............
                    .............99....99...............
                    ....................................
                    ....................................
                    ....................................
                    ..........999999..99999.............
                    ..........999999.9999999............
                    ............99...999.999............
                    ............99...99...99............
                    ............99...99...99............
                    ............99...999.999............
                    ............99...9999999............
                    ............99....99999.............
                    ....................................
                    ....................................
                    ...999999..99999..999999..999...99..
                    ...999999.9999999.999999.9999...99..
                    .....99...999.999...99...99999..99..
                    .....99...99...99...99...99.99..99..
                    .....99...99...99...99...99..99.99..
                    ..99.99...999.999...99...99..99999..
                    ..99999...9999999.999999.99...9999..
                    ...999.....99999..999999.99...999...
                    ....................................
                    ....................................
                    ....................................
                    `, screen2, 121, 45)
            }
        } else {
            screen2.fillRect(122, 42, 33, 50, 15)
        }
        for (let value of mp.allPlayers()) {
            characterSelectSprites[mp.playerToIndex(value)].setFlag(SpriteFlag.Invisible, mp.getPlayerState(value, MultiplayerState.Joined) == 0)
            characterSelectText[mp.playerToIndex(value)].setFlag(SpriteFlag.Invisible, mp.getPlayerState(value, MultiplayerState.Joined) == 0)
            characterSelectSprites[mp.playerToIndex(value)].bottom = 88
            characterSelectText[mp.playerToIndex(value)].top = 92
            if (value == 1) {
                characterSelectSprites[mp.playerToIndex(value)].x = 21
                characterSelectText[mp.playerToIndex(value)].x = 22
            } else if (value == 2) {
                characterSelectSprites[mp.playerToIndex(value)].x = 60
                characterSelectText[mp.playerToIndex(value)].x = 61
            } else if (value == 3) {
                characterSelectSprites[mp.playerToIndex(value)].x = 99
                characterSelectText[mp.playerToIndex(value)].x = 100
            } else {
                characterSelectSprites[mp.playerToIndex(value)].x = 138
                characterSelectText[mp.playerToIndex(value)].x = 139
            }
        }
    }
})
function resetPlayerAfterHeld (upper: number, clearStack: boolean) {
    if (mp.getPlayerState(upper, MultiplayerState.IsPickedUp) == 0) {
        return
    }
    tempNumber = mp.getPlayerState(upper, MultiplayerState.IsPickedUp)
    mp.setPlayerState(upper, MultiplayerState.IsPickedUp, 0)
    if (clearStack) {
        resetPlayerAfterHeld(tempNumber, clearStack)
    }
    mp.getPlayerSprite(upper).setImage(img`
        3 3 3 3 3 
        3 3 3 3 3 
        3 3 3 3 3 
        3 3 3 3 3 
        3 3 3 3 3 
        3 3 3 3 3 
        3 3 3 3 3 
        3 3 3 3 3 
        `)
    platformer.setCharacterAnimationsEnabled(platformer.asPlatformerSprite(mp.getPlayerSprite(upper)), true)
    setControlsEnabled(upper, true)
    if (clearStack) {
        if (mp.getPlayerState(upper, MultiplayerState.IsHoldingPlayer) != 0) {
            resetPlayerAfterHeld(mp.getPlayerState(upper, MultiplayerState.IsHoldingPlayer), true)
            mp.setPlayerState(upper, MultiplayerState.IsHoldingPlayer, 0)
        }
    }
}
function countHeldPlayers (player2: number): any {
    if (mp.getPlayerState(player2, MultiplayerState.IsHoldingPlayer) == 0) {
        return 0
    } else {
        return 1 + countHeldPlayers(mp.getPlayerState(player2, MultiplayerState.IsHoldingPlayer))
    }
}
function drawLives (numberOfLives: number, left: number, top: number, screen2: Image, color: number) {
    for (let index = 0; index <= numberOfLives - 1; index++) {
        screen2.fillRect(left + index % 6 * 3 - 1, top + Math.idiv(index, 6) * 3 - 1, 4, 4, 15)
        screen2.fillRect(left + index % 6 * 3, top + Math.idiv(index, 6) * 3, 2, 2, color)
    }
}
function dropPlayer (player2: number) {
    mp.setPlayerState(player2, MultiplayerState.IsRespawnReadyToDrop, 0)
    mp.setPlayerState(player2, MultiplayerState.IsWaitingToRespawn, 0)
    setControlsEnabled(player2, true)
    mp.getPlayerSprite(player2).setFlag(SpriteFlag.Ghost, false)
    mp.setPlayerState(player2, MultiplayerState.InvincibleEndTime, game.runtime() + invincibleTime)
    tiles.placeOnTile(mp.getPlayerSprite(player2), mp.getPlayerSprite(player2).tilemapLocation())
    if (tiles.tileAtLocationIsWall(mp.getPlayerSprite(player2).tilemapLocation())) {
        for (let index = 0; index <= 8; index++) {
            testAndPlace(mp.getPlayerSprite(player2), index + 1, 0)
            testAndPlace(mp.getPlayerSprite(player2), -1 - index, 0)
            if (!(tiles.tileAtLocationIsWall(mp.getPlayerSprite(player2).tilemapLocation()))) {
                break;
            }
        }
        if (tiles.tileAtLocationIsWall(mp.getPlayerSprite(player2).tilemapLocation())) {
            for (let index = 0; index <= 8; index++) {
                testAndPlace(mp.getPlayerSprite(player2), index + 1, -1)
                testAndPlace(mp.getPlayerSprite(player2), -1 - index, -1)
                if (!(tiles.tileAtLocationIsWall(mp.getPlayerSprite(player2).tilemapLocation()))) {
                    break;
                }
            }
        }
        if (tiles.tileAtLocationIsWall(mp.getPlayerSprite(player2).tilemapLocation())) {
            for (let index = 0; index <= 8; index++) {
                testAndPlace(mp.getPlayerSprite(player2), index + 1, 1)
                testAndPlace(mp.getPlayerSprite(player2), -1 - index, 1)
                if (!(tiles.tileAtLocationIsWall(mp.getPlayerSprite(player2).tilemapLocation()))) {
                    break;
                }
            }
        }
    }
}
spriteutils.addEventHandler(spriteutils.UpdatePriorityModifier.After, spriteutils.UpdatePriority.Camera, function () {
    if (gameState == "playing") {
        for (let value of mp.allPlayers()) {
            if (mp.getPlayerState(value, MultiplayerState.IsRespawnReadyToDrop) == 1) {
                if (gameMode != "race") {
                    mp.getPlayerSprite(value).x = scene.cameraProperty(CameraProperty.Left) + (20 + 40 * mp.playerToIndex(value))
                } else {
                    mp.getPlayerSprite(value).x = scene.cameraProperty(CameraProperty.Left) + (30 + 6 * mp.playerToIndex(value))
                }
                mp.getPlayerSprite(value).top = Math.ceil(scene.cameraProperty(CameraProperty.Top)) + 20
                mp.getPlayerSprite(value).setFlag(SpriteFlag.Invisible, false)
                platformer.setCharacterAnimationsEnabled(platformer.asPlatformerSprite(mp.getPlayerSprite(value)), true)
                mp.getPlayerSprite(value).setVelocity(0, 0)
            } else {
                if (gameMode != "race") {
                    mp.getPlayerSprite(value).left = Math.max(Math.ceil(scene.cameraProperty(CameraProperty.Left)), mp.getPlayerSprite(value).left)
                    mp.getPlayerSprite(value).top = Math.max(Math.ceil(scene.cameraProperty(CameraProperty.Top)), mp.getPlayerSprite(value).top)
                    mp.getPlayerSprite(value).right = Math.min(Math.ceil(scene.cameraProperty(CameraProperty.Right)), mp.getPlayerSprite(value).right)
                } else {
                    if (mp.getPlayerSprite(value).left > scene.cameraProperty(CameraProperty.Right) + 8) {
                        respawnCharacter(value)
                    }
                    if (mp.getPlayerSprite(value).right < scene.cameraProperty(CameraProperty.Left) - 8) {
                        respawnCharacter(value)
                    }
                    if (mp.getPlayerSprite(value).bottom < scene.cameraProperty(CameraProperty.Top) - 8) {
                        respawnCharacter(value)
                    }
                }
                if (mp.getPlayerSprite(value).top > scene.cameraProperty(CameraProperty.Bottom) + 2) {
                    respawnCharacter(value)
                }
                if (tiles.tileAtLocationIsWall(mp.getPlayerSprite(value).tilemapLocation())) {
                    respawnCharacter(value)
                }
            }
        }
    }
})
function checkPickupLegal (picker: number) {
    tempNumber = 8 - mp.getPlayerSprite(picker).top % 8 + countHeldPlayers(picker) * 5
    if (tempNumber > 7) {
        if (tiles.tileAtLocationIsWall(tiles.getTileLocation(Math.idiv(mp.getPlayerSprite(picker).left, 8), Math.idiv(mp.getPlayerSprite(picker).top, 8) - 1))) {
            return false
        }
        if (tiles.tileAtLocationIsWall(tiles.getTileLocation(Math.idiv(mp.getPlayerSprite(picker).right, 8), Math.idiv(mp.getPlayerSprite(picker).top, 8) - 1))) {
            return false
        }
    }
    if (tempNumber > 15) {
        if (tiles.tileAtLocationIsWall(tiles.getTileLocation(Math.idiv(mp.getPlayerSprite(picker).left, 8), Math.idiv(mp.getPlayerSprite(picker).top, 8) - 2))) {
            return false
        }
        if (tiles.tileAtLocationIsWall(tiles.getTileLocation(Math.idiv(mp.getPlayerSprite(picker).right, 8), Math.idiv(mp.getPlayerSprite(picker).top, 8) - 2))) {
            return false
        }
    }
    return true
}
function testAndPlace (sprite: Sprite, colOffset: number, rowOffset: number) {
    if (tiles.getTileLocation(sprite.tilemapLocation().column + colOffset, sprite.tilemapLocation().row + rowOffset).right > scene.cameraProperty(CameraProperty.Right) || tiles.getTileLocation(sprite.tilemapLocation().column + colOffset, sprite.tilemapLocation().row + rowOffset).left < scene.cameraProperty(CameraProperty.Left)) {
        return
    }
    if (!(tiles.tileAtLocationIsWall(tiles.getTileLocation(sprite.tilemapLocation().column + colOffset, sprite.tilemapLocation().row + rowOffset)))) {
        tiles.placeOnTile(sprite, tiles.getTileLocation(sprite.tilemapLocation().column + colOffset, sprite.tilemapLocation().row + rowOffset))
    }
}
function positionSprite (picker: number, upper: number) {
    if (mp.getPlayerState(picker, MultiplayerState.IsPickedUp) != 0) {
        mp.getPlayerSprite(upper).bottom = mp.getPlayerSprite(picker).top
    } else {
        mp.getPlayerSprite(upper).bottom = mp.getPlayerSprite(picker).bottom - 8
    }
    mp.getPlayerSprite(upper).x = mp.getPlayerSprite(picker).x
    mp.getPlayerSprite(upper).setVelocity(0, 0)
    if (mp.getPlayerState(upper, MultiplayerState.IsHoldingPlayer) != 0) {
        positionSprite(upper, mp.getPlayerState(upper, MultiplayerState.IsHoldingPlayer))
    }
}
scene.onOverlapTile(SpriteKind.Player, assets.tile`myTile11`, function (sprite, location) {
	
})
scene.onOverlapTile(SpriteKind.Player, assets.tile`myTile0`, function (sprite, location) {
    if (sprite.bottom > location.top + 4) {
        respawnCharacter(mp.indexToPlayer(players.indexOf(sprite)))
    }
})
let textSprite: TextSprite = null
let characterSelectSprites: Sprite[] = []
let scores: number[] = []
let myMenu: miniMenu.MenuSprite = null
let tempImageArray: Image[] = []
let tempLocation: tiles.Location = null
let cameraWaypoints: Image[] = []
let cameraTarget: Sprite = null
let camera: Sprite = null
let p4: platformer.PlatformerSprite = null
let p3: platformer.PlatformerSprite = null
let p2: platformer.PlatformerSprite = null
let p1: platformer.PlatformerSprite = null
let numberPlayersHeld = 0
let KOLog: number[][] = []
let row = 0
let col = 0
let gameMode = ""
let characterSelectText: TextSprite[] = []
let winners: number[] = []
let players: Sprite[] = []
let characterTemplates: blockObject.BlockObject[] = []
let tempPSprite: platformer.PlatformerSprite = null
let tempSprite: Sprite = null
let gameState = ""
let tempNumber = 0
let titleColors: number[] = []
let startingStockLives = 0
let waypointDelayTime = 0
let fallingBlockDelay = 0
let respawnTime = 0
let cameraSpeed = 0
let invincibleTime = 0
let breakawayStunTime = 0
let throwSpeed = 0
let koAttributionTime = 0
let moveSpeed = 0
let conveyorSpeed = 0
let matchTime = 0
let respawnHangTime = 0
let debug = false
debug = true
respawnHangTime = 5000
matchTime = 120
conveyorSpeed = 30
moveSpeed = 100
koAttributionTime = 1000
throwSpeed = 300
breakawayStunTime = 1000
invincibleTime = 2000
cameraSpeed = 50
respawnTime = 2000
fallingBlockDelay = 500
waypointDelayTime = 0
startingStockLives = 9
titleColors = [
9,
3,
5,
7
]
let raceMaps: number[] = []
let scrollMaps: number[] = []
let battleMaps: number[] = []
createCharacters()
startCharacterSelect()
game.onUpdate(function () {
    if (gameState == "playing" && gameMode == "race") {
        tempNumber = spriteutils.distanceBetween(camera, cameraTarget)
        if (tempNumber > 60) {
            camera.follow(cameraTarget, 0)
        }
        for (let value of mp.allPlayers()) {
            if (mp.getPlayerState(value, MultiplayerState.IsWaitingToRespawn) == 0 && mp.getPlayerState(value, MultiplayerState.IsRespawnReadyToDrop) == 0 && mp.getPlayerState(value, MultiplayerState.Joined) != 0) {
                if (tempNumber - 20 > spriteutils.distanceBetween(mp.getPlayerSprite(value), cameraTarget)) {
                    camera.follow(cameraTarget, 100)
                    spriteutils.setVelocityAtAngle(camera, spriteutils.angleFrom(camera, cameraTarget), 100)
                }
            }
        }
    }
})
game.onUpdate(function () {
    if (gameState == "playing") {
        for (let value of mp.allPlayers()) {
            if (mp.getPlayerState(value, MultiplayerState.IsPickedUp) != 0) {
                positionSprite(mp.getPlayerState(value, MultiplayerState.IsPickedUp), value)
            }
            if (mp.getPlayerState(value, MultiplayerState.StunTimer) != 0 && mp.getPlayerState(value, MultiplayerState.StunTimer) < game.runtime()) {
                mp.setPlayerState(value, MultiplayerState.StunTimer, 0)
                resetPlayerAfterHeld(value, false)
            }
            if (mp.getPlayerState(value, MultiplayerState.IsRespawnReadyToDrop) == 1 && mp.getPlayerState(value, MultiplayerState.RespawnTimer) < game.runtime()) {
                dropPlayer(value)
            }
        }
        if (spriteutils.distanceBetween(camera, cameraTarget) == 0) {
            moveToNextWaypoint()
        }
    }
})
