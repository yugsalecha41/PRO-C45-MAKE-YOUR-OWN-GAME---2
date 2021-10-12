var canvas;
var edges;

var ground;
var gameBackground, backgroundImage;

var alien, alienAnimation, alienStabbed;
var apple, appleImage, applesGroup;
var plant1, plant2, plantImage1, plantImage2, plantsGroup;

var gameOver, gameOverImage;
var restart, restartImage;

var gameState = "play";
var hitCount = 0, initialScale = 0.3;
var survivalTime = 0;
var message= "", displayMessage = false;
var startTime = 0;

const DISPLAY_DURATION = 3000;

function preload()
{
    //Load alien assets.
    alienAnimation = loadAnimation("images/alien_01.png", "images/alien_02.png",
        "images/alien_03.png", "images/alien_04.png", "images/alien_05.png",
        "images/alien_06.png", "images/alien_07.png", "images/alien_08.png",
        "images/alien_09.png", "images/alien_10.png", "images/alien_11.png",
        "images/alien_12.png", "images/alien_13.png");
    alienStabbed = loadImage("images/alien_09.png");

    //Load background image.
    backgroundImage = loadImage("images/jungle.png");

    //Load apple image.
    appleImage = loadImage("images/apple.png");

    //Load plant assets.
    plantImage1 = loadImage("images/plant1.png");
    plantImage2 = loadImage("images/plant2.png");
}

function setup()
{
    //Create play area.
    canvas = createCanvas(displayWidth - 300, displayHeight - 200);
    canvas.position(20, 20);

    //Create the edges.
    edges = createEdgeSprites();

    //Create sprite for game background.
    gameBackground = createSprite(0, 0, width, height);
    gameBackground.addImage(backgroundImage);
    gameBackground.scale = 2.5;
    gameBackground.x = gameBackground.width / 2;

    //Create invisible ground.
    ground = createSprite(0, height - 50, width * 2, 10);
    //ground.visible = false;

    //Create alien.
    alien = createSprite(100, height - 50);
    alien.addAnimation("running", alienAnimation);
    alien.addImage("stabbed", alienStabbed);
    alien.scale = initialScale;
    alien.setCollider("rectangle", 0, 0, 180, alien.height - 20);

    //Create plants group.
    plantsGroup = new Group();

    //Create apples group.
    applesGroup = new Group();

    //Set start time.
    startTime = 0;

    //Adjust text.
    fill("black");
    stroke("black");
    textSize(25);
}

function draw()
{
    //Clear the screen and paint it.
    background("black");

    //Display the sprites.
    drawSprites();

    //Display the survival time.
    text("Survival Time: " + survivalTime, 50, 50);

    if(gameState === "play")
    {
        //Calcuclate survival time.
        if(frameCount % 20 === 0)
        {
            survivalTime++;
        }

        //Move the background infinitely.
        gameBackground.velocityX = -3;
        if(gameBackground.x < 0)
        {
            gameBackground.x = gameBackground.width / 2;
        }

        //Jump alien as high as possible.
        if(keyDown("space"))
        {
            alien.velocityY = -12;
        }

        //Add gravity fort the alien.
        alien.velocityY = alien.velocityY + 0.8;

        //When the alien hits the top edge, bounce him off.
        alien.bounceOff(edges[2]);

        if(survivalTime > 0 && survivalTime % 50 === 0)
        {
            // Record the time of the event
            startTime = millis();
            var num = Math.round(random(1, 3));
            message = num === 1 ? "You are doing well." :
                num === 2 ? "Good job !" :
                num === 3 ? "You are a pro !!" : "";
            if(message !== "")
            {
                displayMessage = true;
            }
        }

        //Display messages as per progress made.
        if(startTime !== 0)
        {   
            if(displayMessage)
            {
                text(message, width/2, height/2);

                // If the spent time is above the defined duration.
                if (millis() - startTime > DISPLAY_DURATION)
                {
                    // Stop displaying the message.
                    displayMessage = false;
                    startTime = 0;
                }
            }
        }

        //Spawn apples randomly.
        spawnApples();

        //Spawn the vines randomly.
        spawnVines();

        //When alien eats apple, he will grow in size.
        for(var i = 0; i < applesGroup.length; i++)
        {
            if(applesGroup.isTouching(alien))
            {
                applesGroup.get(i).destroy();
                alien.scale += 0.01;
            }
        }

        //Alien hits the plant.
        if(plantsGroup.isTouching(alien))
        {
            hitCount++;

            //First time, reduce size of alien.
            if(hitCount === 1)
            {
                if(alien.scale === initialScale)
                {
                    gameState = "end";
                }
                else
                {
                    alien.scale = 0.1;
                    plantsGroup.destroyEach();
                }
            }
            
            //Next time, end the game.
            if(hitCount > 1)
            {
                gameState = "end";
            }
        }
    }

    if(gameState === "end")
    {
        //Stop moving background.
        gameBackground.velocityX = 0;

        //Stop moving alien and change image to stabbed image.
        alien.velocityY = 0;
        alien.changeAnimation("stabbed", alienStabbed);

        //Stop moving plants and chane their lifetime.
        plantsGroup.setVelocityXEach(0);
        plantsGroup.setLifetimeEach(-1);

        //Stop moving apples and destroy them.
        applesGroup.setVelocityXEach(0);
        applesGroup.destroyEach();
    }

    //Support alien on the invisible ground.
    alien.collide(ground);
}

//Create the viscous plants every few frames.
function spawnVines()
{
    // Spawn plant 1.
    if(frameCount % 150 === 0)
    {
        plant1 = createSprite(width, height - 100);
        plant1.addImage(plantImage1);
        plant1.scale = 0.5;
        plant1.velocityX = -4;
        plant1.lifetime = width / Math.abs(plant1.velocityX);
        plant1.setCollider("rectangle", 0, 0, 100, plant1.height);
        plantsGroup.add(plant1);
    }

    //Spawn plant 2.
    if(frameCount % 250 === 0)
    {
        plant2 = createSprite(width, 100);
        plant2.addImage(plantImage2);
        plant2.scale = 0.6;
        plant2.velocityX = -4;
        plant2.lifetime = width / Math.abs(plant2.velocityX);
        plant2.setCollider("rectangle", 0, 0, 100, plant2.height);
        plantsGroup.add(plant2);
    }

    //If both plants appear together, then remove any one.
    if(frameCount % 150 === 0 && frameCount % 250 === 0)
    {
        var rand = Math.round(random(1, 2));
        if(rand === 1)
        {
            plant1.lifetime = 0;
        }
        if(rand === 2)
        {
            plant2.lifetime = 0;
        }
    }
}

//Spawn the apples randomly.
function spawnApples()
{
    if(frameCount % 400 === 0)
    {
        apple = createSprite(width, 100, 50, 50);
        apple.y = Math.round(random(50, height/2));
        apple.addImage("power", appleImage);
        apple.scale = 0.3;
        apple.velocityX = -5;
        apple.lifetime = width / Math.abs(apple.velocityX);
        applesGroup.add(apple);
    }
}