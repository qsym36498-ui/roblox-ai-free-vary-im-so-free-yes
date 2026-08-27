const KNOWLEDGE_BASE = {
    luau_keywords: {
        "local": "local هو الكلمة المفتاحية لتعريف متغير محلي. لا يمكن الوصول إليه من خارج النطاق.",
        "function": "function لتعريف دالة. function name() ... end",
        "if": "if للشروط. if condition then ... elseif condition2 then ... else ... end",
        "for": "for للتكرار. for i = 1, 10 do ... end أو for _, v in pairs(table) do ... end",
        "while": "while للتكرار الشرطي. while condition do ... end",
        "repeat": "repeat لالتكرار حتى تنفيذ شرط. repeat ... until condition",
        "return": "return لإرجاع قيمة من دالة.",
        "end": "end لإنهاء كتلة برمجية (function, if, for, while, do).",
        "then": "then تُستخدم بعد if و الشرط.",
        "else": "else للحالة البديلة في الشروط.",
        "elseif": "elseif لشرط إضافي.",
        "do": "do تُستخدم مع for و while.",
        "in": "in تُستخدم في for loop مع pairs/ipairs.",
        "true": "true قيمة منطقية صحيحة.",
        "false": "false قيمة منطقية خاطئة.",
        "nil": "nil يعني عدم وجود قيمة.",
        "and": "and عامل منطقي AND.",
        "or": "or عامل منطقي OR.",
        "not": "not عامل منطقي NOT.",
        "break": "break لإخراج من الحلقة.",
        "continue": "continue للانتقال للتكرار التالي (في Luau فقط).",
        "type": "type لتعريف نوع بيانات في Luau. type Name = string",
        "export": "export لتصدير أنواع في Luau.",
        "typeof": "typeof() لإرجاع نوع قيمة في Runtime.",
        "require": "require() لاستيراد ModuleScript."
    },
    data_types: {
        "number": "النوع العددي. يشمل الأعداد الصحيحة والكسرية.\nمثال: local x = 42, local y = 3.14",
        "string": "النوع النصي. يُستخدم للنصوص.\nمثال: local name = 'Ahmed' أو local text = \"Hello\"",
        "boolean": "النوع المنطقي. true أو false.\nمثال: local isActive = true",
        "nil": "قيمة فارغة/عدم وجود. تدل على أن المتغير غير مُعرّف.",
        "table": "الجدول - بنية البيانات الأساسية في Lua.\nمثال: local t = {1, 2, 3} أو local t = {name='Ahmed', age=25}",
        "function": "الدالة. كيان يمكن استدعاؤه.\nمثال: local function add(a, b) return a + b end",
        "userdata": "نوع خاص بـ Roblox يمثل الكائنات مثل Part و Model.",
        "Instance": "نوع كائن Roblox. جميع الأشياء في اللعبة هي Instance.\nمثال: local part = Instance.new('Part')",
        "Vector3": "فيزياء ثلاثية الأبعاد. يمثل موضع/حجم/اتجاه.\nمثال: Vector3.new(1, 2, 3) أو Vector3.zero",
        "Vector2": "فيزياء ثنائية الأبعاد. تُستخدم في GUI.\nمثال: Vector2.new(100, 200)",
        "CFrame": "مصفوفة تمثيل الموقع والدوران معاً.\nمثال: CFrame.new(0, 10, 0) أو CFrame.Angles(0, math.rad(90), 0)",
        "Color3": "اللون. يتكون من مكونات RGB.\nمثال: Color3.new(1, 0, 0) أو Color3.fromRGB(255, 0, 0)",
        "UDim2": "البعد مع وحدة. يُستخدم في GUI.\nمثال: UDim2.new(0.5, 0, 0.5, 0) - 50% من العرض والارتفاع",
        "Enum": "مجموعة قيم محددة مسبقاً.\nمثال: Enum.Material.Neon, Enum.PartType.Block",
        "BrickColor": "اللون التقليدي في Roblox.\nمثال: BrickColor.new('Bright red')",
        "Ray": "شعاع. يُستخدم في Raycasting.\nمثال: Ray.new(origin, direction)",
        "TweenInfo": "معلومات الحركة.\nمثال: TweenInfo.new(1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)",
        "Rect": "مستطيل. يُستخدم في GUI.\nمثال: Rect.new(0, 0, 100, 100)",
        "NumberRange": "نطاق أرقام.\nمثال: NumberRange.new(1, 10)",
        "NumberSequence": "تسلسل أرقام للحركة.\nمثال: NumberSequence.new(0, 1, 0)",
        "ColorSequence": "تسلسل ألوان.\nمثال: ColorSequence.new(Color3.new(1,0,0), Color3.new(0,0,1))"
    },
    roblox_api: {
        "Instance": {
            "desc": "الكائن الأساسي في Roblox. جميع الأشياء ترث منه.",
            "properties": "Name, Parent, ClassName, Archivable, TextureID",
            "methods": "Clone(), Destroy(), FindFirstChild(), GetChildren(), GetDescendants(), WaitForChild(), IsA(), GetService(), ClearAllChildren(), Remove(), Wait(), Connect(), Disconnect()",
            "example": "local part = Instance.new('Part')\npart.Name = 'MyPart'\npart.Parent = workspace"
        },
        "Part": {
            "desc": "كائن جسيم فيزيائي. bloc, sphere, cylinder, wedge, cornerwedge.",
            "properties": "Position, Size, Color, Material, Transparency, CanCollide, Anchored, Shape, BrickColor, CFrame, Velocity, RotationVelocity, Massless, CustomPhysicalProperties",
            "methods": "GetTouchingParts(), GetMass(), BreakJoints(), MakeJoints(), Clone(), Destroy()",
            "example": "local part = Instance.new('Part')\npart.Size = Vector3.new(4, 1, 4)\npart.Position = Vector3.new(0, 10, 0)\npart.BrickColor = BrickColor.new('Bright blue')\npart.Anchored = true\npart.Parent = workspace"
        },
        "Script": {
            "desc": "سكربت يعمل على الخادم. ServerScript.",
            "properties": "Source (للقراءة فقط في Studio), Enabled",
            "example": "-- Server Script\nprint('Hello from server!')\n\nlocal part = Instance.new('Part')\npart.Parent = workspace"
        },
        "LocalScript": {
            "desc": "سكربت يعمل على جهاز اللاعب. ClientScript.",
            "example": "-- Local Script\nlocal Players = game:GetService('Players')\nlocal player = Players.LocalPlayer\nprint('Hello ' .. player.Name)"
        },
        "ModuleScript": {
            "desc": "وحدة قابلة للاستيراد بأكثر من مكان.",
            "example": "-- ModuleScript (ModuleName)\nlocal Module = {}\n\nfunction Module.add(a, b)\n    return a + b\nend\n\nreturn Module\n\n-- في سكربت آخر:\nlocal Module = require(script.ModuleName)\nprint(Module.add(2, 3)) -- 5"
        },
        "Model": {
            "desc": "موديل يحتوي على عدة كائنات.",
            "properties": "PrimaryPart, LevelOfDetail, ModelStreaming, WorldPivot",
            "methods": "GetBoundingBox(), GetPrimaryPartCFrame(), MoveTo(), SetPrimaryPartCFrame(), BreakJoints()",
            "example": "local model = Instance.new('Model')\nmodel.Name = 'MyModel'\nlocal part = Instance.new('Part')\npart.Parent = model\nmodel.PrimaryPart = part\nmodel.Parent = workspace"
        },
        "Folder": {
            "desc": "مجلد لتنظيم الأشياء.",
            "example": "local folder = Instance.new('Folder')\nfolder.Name = 'MyFolder'\nfolder.Parent = workspace"
        },
        "BasePart": {
            "desc": "الكائن الأساسي لجميع الأشكال الفيزيائية. يشمل Part و MeshPart و UnionOperation.",
            "properties": "Anchored, BackSurface, BottomSurface, CanCollide, CanTouch, CanQuery, CFrame, Color, CustomPhysicalProperties, Material, MaterialVariant, Massless, Orientation, Position, Size, TopSurface, Transparency, BrickColor, Reflectance, RenderFidelity, RootPriority",
            "methods": "ApplyImpulse(), ApplyImpulseAtPosition(), GetAxisAlignedBoundingBox(), GetBoundingBox(), GetClosestPointOnSurface(), GetDecomposedRegion(), GetMass(), GetMaterialColor(), GetPivot(), GetRenderCFrame(), GetScale(), GetSurfaceColor(), GetSurfaceNormal(), IsGrounded(), MakeJoints(), BreakJoints(), MoveTo(), PivotTo(), Resize(), SetAttribute(), ApplyDamage()",
        },
        "Decal": {
            "desc": "صورة تُطبق على سطح Part.",
            "properties": "Texture, TexturePath, Face, Transparency, Color3, ZIndex",
            "example": "local decal = Instance.new('Decal')\ndecal.Texture = 'rbxassetid://12345678'\ndecal.Face = Enum.NormalId.Front\npart.Parent = workspace"
        },
        "Texture": {
            "desc": "نسيج يُطبق على جميع أسطح Part.",
            "properties": "Texture, StudsPerTileU, StudsPerTileV, Face, OffsetStudsU, OffsetStudsV, TexturePack"
        },
        "MeshPart": {
            "desc": "جزء ب警告 3D مخصص.",
            "properties": "MeshID, TextureID, RenderFidelity, CollisionFidelity, TriangleCount",
        },
        "UnionOperation": {
            "desc": "نتيجة عملية Solid Modeling (دمج أشكال).",
            "properties": "UsePartColor"
        },
        "WedgePart": {
            "desc": "شكل مثلث زاوي.",
            "properties": " inherits from BasePart"
        },
        "SpawnLocation": {
            "desc": "مكان ظهور اللاعبين.",
            "properties": "Duration, Neutral, AllowTeamChangeOnTouch, TeamColor, SpawnEnabled",
            "example": "local spawn = Instance.new('SpawnLocation')\nspawn.Position = Vector3.new(0, 5, 0)\nspawn.Anchored = true\nspawn.Parent = workspace"
        },
        "Camera": {
            "desc": "كاميرا اللعبة.",
            "properties": "CameraType, CameraSubject, CFrame, FieldOfView, Focus, HeadScale, ViewportSize",
            "methods": "GetRenderCFrame(), Interpolate(), ScreenPointToRay(), WorldToViewportPoint(), ViewportPointToRay()",
            "example": "local camera = workspace.CurrentCamera\ncamera.CameraType = Enum.CameraType.Scriptable\ncamera.CFrame = CFrame.new(0, 50, 0) * CFrame.Angles(math.rad(-90), 0, 0)"
        },
        "Terrain": {
            "desc": "أرضية التضاريس في Roblox.",
            "properties": "MaterialColors, WaterColor, WaterReflectance, WaterTransparency, WaterWaveSize, WaterWaveSpeed",
            "methods": "FillBlock(), FillWedge(), FillRegion(), FillSphere(), FillCylinder(), GetMaterialColor(), SetMaterialColor(), ErodeRegion(), SmoothRegion(), ReplaceMaterial()",
        },
        "Workspace": {
            "desc": "المساحة العاملة. تحتوي على جميع الكائنات المرئية.",
            "properties": "CurrentCamera, FallenPartsDestroyHeight, Gravity, StreamingEnabled",
            "example": "local ws = game.Workspace\nlocal part = ws:FindFirstChild('MyPart')\nif part then\n    print(part.Name)\nend"
        },
        "Players": {
            "desc": "خدمة اللاعبين.",
            "properties": "LocalPlayer, MaxPlayers, NumPlayers, CharacterAutoLoads",
            "methods": "GetPlayers(), GetPlayerFromCharacter(), GetPlayers()",
            "events": "PlayerAdded, PlayerRemoving, CharacterAdded, CharacterRemoving",
            "example": "local Players = game:GetService('Players')\nPlayers.PlayerAdded:Connect(function(player)\n    print(player.Name .. ' joined!')\n    player.CharacterAdded:Connect(function(char)\n        local hrp = char:WaitForChild('HumanoidRootPart')\n        print('Character loaded for ' .. player.Name)\n    end)\nend)"
        },
        "ReplicatedStorage": {
            "desc": "مخزن للكائنات المشتركة بين الخادم والعميل.",
            "example": "local RS = game:GetService('ReplicatedStorage')\nlocal remote = RS:WaitForChild('MyRemoteEvent')\nremote:FireServer('Hello')"
        },
        "ServerScriptService": {
            "desc": "خدمة سكربتات الخادم.",
            "example": "local SSS = game:GetService('ServerScriptService')"
        },
        "ServerStorage": {
            "desc": "مخزن خاص بالخادم.",
        },
        "StarterGui": {
            "desc": "واجهات المستخدم التي تبدأ مع اللاعب.",
        },
        "StarterPack": {
            "desc": "الأدوات التي تبدأ مع اللاعب.",
        },
        "StarterPlayer": {
            "desc": "إعدادات اللاعب الأساسية.",
            "properties": "CameraMinZoomDistance, CameraMaxZoomDistance, CharacterJumpHeight, CharacterJumpPower, CharacterUseJumpPower, LoadCharacterAppearance",
        },
        "Lighting": {
            "desc": "خدمة الإضاءة والجو العام.",
            "properties": "Ambient, Brightness, ColorShift_Bottom, ColorShift_Top, EnvironmentDiffuseScale, EnvironmentSpecularScale, GlobalShadows, OutdoorAmbient, ClockTime, GeographicLatitude, TimeOfDay, ExposureCompensity, FogColor, FogEnd, FogStart",
            "methods": "GetMinutesAfterMidnight(), SetMinutesAfterMidnight(), GetSunPosition()",
            "example": "local Lighting = game:GetService('Lighting')\nLighting.Ambient = Color3.fromRGB(50, 50, 50)\nLighting.Brightness = 2\nLighting.ClockTime = 14\nLighting.GlobalShadows = true"
        },
        "TweenService": {
            "desc": "خدمة الحركات والانتقالات السلسة.",
            "methods": "Create(), Schedule(), Disable(), Enable()",
            "example": "local TS = game:GetService('TweenService')\nlocal info = TweenInfo.new(\n    2, -- المدة\n    Enum.EasingStyle.Quad, -- نمط الحركة\n    Enum.EasingDirection.Out, -- اتجاه الحركة\n    0, -- التكرارات\n    false, -- العودة\n    0 -- التأخير\n)\nlocal goals = {Position = Vector3.new(0, 20, 0), Transparency = 0.5}\nlocal tween = TS:Create(part, info, goals)\ntween:Play()"
        },
        "RunService": {
            "desc": "خدمة التشغيل المستمر. تُستخدم لتحديث الأشياء في كل فريم.",
            "events": "Heartbeat, RenderStepped, Stepped",
            "methods": "Bind(), Unbind(), IsRunning()",
            "example": "local RS = game:GetService('RunService')\nRS.Heartbeat:Connect(function(deltaTime)\n    -- يُنفذ كل فريم\n    part.Position += Vector3.new(0, deltaTime * 5, 0)\nend)"
        },
        "UserInputService": {
            "desc": "خدمة مدخلات المستخدم (لوحة المفاتيح والماسورة).",
            "methods": "GetLastInputType(), GetMouseLocation(), InputBegan, InputChanged, InputEnded, IsKeyDown(), IsMouseButtonPressed(), IsGamepadPressed()",
            "example": "local UIS = game:GetService('UserInputService')\nUIS.InputBegan:Connect(function(input, processed)\n    if processed then return end\n    if input.KeyCode == Enum.KeyCode.E then\n        print('E pressed!')\n    end\nend)"
        },
        "HttpService": {
            "desc": "خدمة HTTP للاتصال بالشبكة.",
            "methods": "GetAsync(), PostAsync(), RequestAsync(), GenerateGUID()",
            "example": "local HttpService = game:GetService('HttpService')\nlocal data = HttpService:GetAsync('https://api.example.com/data')\nprint(data)"
        },
        "DataStoreService": {
            "desc": "خدمة حفظ البيانات. لتخزين معلومات اللاعبين.",
            "methods": "GetAsync(), SetAsync(), UpdateAsync(), RemoveAsync(), GetOrderedDataStore(), GetRequestBudgetForRequestType(), GetRequestHandlerService(), IncrementAsync(), SetIncrementAsync(), GetVersionAsync(), ListVersionsAsync(), RemoveVersionAsync(), GetSortedAsync()",
            "events": "OnUpdate",
            "example": "local DSS = game:GetService('DataStoreService')\nlocal store = DSS:GetDataStore('PlayerData')\n\n-- حفظ البيانات\nstore:SetAsync('player_123_coins', 1000)\n\n-- تحميل البيانات\nlocal coins = store:GetAsync('player_123_coins')\nprint(coins)"
        },
        "MarketplaceService": {
            "desc": "خدمة المتجر. للعمليات المالية.",
            "methods": "PromptProductPurchase(), PromptPurchase(), PromptSubscriptionCancellation(), UserOwnsGamePassAsync(), UserHasPassAsync(), ProcessReceipt()",
            "events": "PromptProductPurchaseFinished, PromptPurchaseFinished, PromptSubscriptionCancellationFinished",
        },
        "PathfindingService": {
            "desc": "خدمة المسارات. للعثور على أفضل طريق بين نقطتين.",
            "methods": "CreatePath(), ComputeRawPathAsync(), ComputeSmoothPathAsync()",
            "example": "local PS = game:GetService('PathfindingService')\nlocal path = PS:CreatePath({\n    AgentRadius = 2,\n    AgentHeight = 5,\n    AgentCanJump = true\n})\n\npath:ComputeAsync(startPos, endPos)\nif path.Status == Enum.PathStatus.Success then\n    local waypoints = path:GetWaypoints()\n    for _, wp in ipairs(waypoints) do\n        humanoid:MoveTo(wp.Position)\n        humanoid.MoveToFinished:Wait()\n    end\nend"
        },
        "CollectionService": {
            "desc": "خدمة التجميع. لإدارة مجموعات من الكائنات.",
            "methods": "AddTag(), GetTagged(), HasTag(), RemoveTag(), GetInstanceAddedSignal(), GetInstanceRemovedSignal()",
            "example": "local CS = game:GetService('CollectionService')\nCS:AddTag(part, 'Collectible')\n\n-- البحث عن كل الأشياء المُعلمة\nlocal collectibles = CS:GetTagged('Collectible')"
        },
        "PhysicsService": {
            "desc": "خدمة الفيزياء. لإدارة التفاعلات.",
            "methods": "CollisionGroupSetCollidable(), CollisionGroupsAreCollidable(), CreateCollisionGroup(), RegisterCollisionGroup(), UnregisterCollisionGroup()",
        },
        "Teams": {
            "desc": "خدمة الفرق.",
            "properties": "Children",
            "methods": "GetTeams(), GetTeamColor()"
        },
        "SoundService": {
            "desc": "خدمة الصوت.",
            "properties": "AmbientReverb, DistanceFactor, DopplerScale, RolloffScale",
        },
        "StarterGear": {
            "desc": "الأدوات الأساسية للاعب.",
        },
        "Chat": {
            "desc": "خدمة المحادثة.",
        }
    },
    services_examples: {
        "ReplicatedFirst": "يحتوي على كائنات تُنسخ أولاً لتسريع التحميل.",
        "AnalyticsService": "خدمة التحليلات.",
        "SocialService": "خدمة اجتماعية. InviteToParty, PromptSocialInformationFollow, ReportAvatarIssue, ReportChatIssue",
        "TeleportService": "خدمة النقل بين الألعاب. Teleport, TeleportToPlaceInstance",
        "TextChatService": "خدمة المحادثة النصية الجديدة.",
        "PointsService": "خدمة النقاط.",
        "ProximityPromptService": "خدمة الإشارات القريبة.",
        "Region3": "منطقة ثلاثية الأبعاد.",
        "BadgeService": "خدمة الشارات.",
        "GroupService": "خدمة المجموعات.",
        "InsertService": "خدمة الإدخال.",
        "KeyframeSequenceProvider": "مزود تسلسلات الإطارات."
    },
    gui_hierarchy: {
        "ScreenGui": "شاشة GUI أساسية.",
        "Frame": "إطار أساسي للواجهة.",
        "TextLabel": "نص للعرض فقط.",
        "TextButton": "زر بنص.",
        "ImageButton": "زر بصورة.",
        "ImageLabel": "صورة للعرض فقط.",
        "ScrollingFrame": "إطار قابل للتمرير.",
        "TextBox": "حقل إدخال نص.",
        "TextLabel": "تسمية نص.",
        "UIListLayout": "تخطيط قائمة تلقائي.",
        "UIGridLayout": "تخطيط شبكة.",
        "UIPadding": "حشوة داخلية.",
        "UISizeConstraint": "قيود الحجم.",
        "UIAspectRatioConstraint": "قيود نسبة العرض للارتفاع。",
        "UICorner": "زوايا مستديرة.",
        "UIStroke": "حدود.",
        "UIGradient": "تدرج لوني.",
        "UIPageLayout": "تخطيط صفحات.",
        "UITableLayout": "تخطيط جدول.",
        "ViewportFrame": "إطار عرض ثلاثي الأبعاد."
    },
    common_patterns: {
        "wait_for_child": {
            "desc": "انتظار كائن حتى يظهر.",
            "code": "local part = parent:WaitForChild('PartName', 10)\nif part then\n    -- تم العثور عليه\nelse\n    warn('Part not found after 10 seconds')\nend"
        },
        "findFirstChild": {
            "desc": "البحث عن كائن فوري.",
            "code": "local part = parent:FindFirstChild('PartName')\nif part then\n    -- تم العثور عليه\nend"
        },
        "togglePart": {
            "desc": "إظهار/إخفاء جسيم.",
            "code": "local function togglePart(part, show)\n    part.Transparency = show and 0 or 1\n    part.CanCollide = show\nend"
        },
        "connectEvent": {
            "desc": "ربط حدث بدالة.",
            "code": "local connection\nconnection = someEvent:Connect(function(...)\n    -- معالجة الحدث\nend)\n-- للفصل:\n-- connection:Disconnect()"
        },
        "waitForInput": {
            "desc": "انتظار مدخل مستخدم.",
            "code": "local UIS = game:GetService('UserInputService')\nUIS.InputBegan:Connect(function(input, gameProcessed)\n    if gameProcessed then return end\n    if input.KeyCode == Enum.KeyCode.E then\n        -- تم ضغط E\n    end\nend)"
        },
        "basicTween": {
            "desc": "حركة بسيطة.",
            "code": "local TS = game:GetService('TweenService')\nlocal tweenInfo = TweenInfo.new(1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)\ntween = TS:Create(part, tweenInfo, {Position = part.Position + Vector3.new(0, 10, 0)})\ntween:Play()"
        },
        "raycast": {
            "desc": " إطلاق شعاع لاكتشاف الكائنات.",
            "code": "local RS = game:GetService('RaycastService')\nlocal origin = part.Position\nlocal direction = Vector3.new(0, -50, 0)\nlocal params = RaycastParams.new()\nparams.FilterDescendantsInstances = {part}\nparams.FilterType = Enum.RaycastFilterType.Exclude\n\nlocal result = workspace:Raycast(origin, direction, params)\nif result then\n    print('Hit: ' .. result.Instance.Name)\n    print('Position: ' .. tostring(result.Position))\n    print('Normal: ' .. tostring(result.Normal))\nend"
        },
        "dataStoreSave": {
            "desc": "حفظ بيانات مع معالجة أخطاء.",
            "code": "local DSS = game:GetService('DataStoreService')\nlocal store = DSS:GetDataStore('MyData')\n\nlocal function saveData(key, value)\n    local success, err = pcall(function()\n        store:SetAsync(key, value)\n    end)\n    if success then\n        print('Data saved successfully!')\n    else\n        warn('Failed to save data: ' .. tostring(err))\n    end\nend\n\nlocal function loadData(key)\n    local success, result = pcall(function()\n        return store:GetAsync(key)\n    end)\n    if success then\n        return result\n    else\n        warn('Failed to load data: ' .. tostring(result))\n        return nil\n    end\nend"
        },
        "leaderstats": {
            "desc": "إنشاء إحصائيات في لوحة الصدارة.",
            "code": "local Players = game:GetService('Players')\n\nPlayers.PlayerAdded:Connect(function(player)\n    local leaderstats = Instance.new('Folder')\n    leaderstats.Name = 'leaderstats'\n    leaderstats.Parent = player\n\n    local coins = Instance.new('IntValue')\n    coins.Name = 'Coins'\n    coins.Value = 0\n    coins.Parent = leaderstats\n\n    local level = Instance.new('IntValue')\n    level.Name = 'Level'\n    level.Value = 1\n    level.Parent = leaderstats\nend)"
        },
        "respawn": {
            "desc": "إعادة ظهور اللاعب.",
            "code": "local Players = game:GetService('Players')\n\nlocal function respawnPlayer(player)\n    task.wait(5) -- انتظار 5 ثواني\n    player:LoadCharacter()\nend\n\nPlayers.PlayerAdded:Connect(function(player)\n    player.CharacterAdded:Connect(function(character)\n        local humanoid = character:WaitForChild('Humanoid')\n        humanoid.Died:Connect(function()\n            respawnPlayer(player)\n        end)\n    end)\nend)"
        },
        "proximity_prompt": {
            "desc": "إشارة تفاعل قريبة.",
            "code": "local pp = Instance.new('ProximityPrompt')\npp.ActionText = 'تفاعل'\npp.ObjectText = 'صندوق'\npp.MaxActivationDistance = 10\npp.HoldDuration = 1\npp.RequiresLineOfSight = false\npp.Parent = part\n\npp.Triggered:Connect(function(player)\n    print(player.Name .. ' interacted!')\nend)"
        },
        "knockback": {
            "desc": "تأثير الباباخ.",
            "code": "local function applyKnockback(character, direction, force)\n    local hrp = character:FindFirstChild('HumanoidRootPart')\n    if hrp then\n        local bodyVelocity = Instance.new('BodyVelocity')\n        bodyVelocity.Velocity = direction * force\n        bodyVelocity.MaxForce = Vector3.new(1e5, 1e5, 1e5)\n        bodyVelocity.P = 1000\n        bodyVelocity.Parent = hrp\n        game:GetService('Debris'):AddItem(bodyVelocity, 0.2)\n    end\nend"
        },
        "cashSystem": {
            "desc": "نظام عملات.",
            "code": "local Players = game:GetService('Players')\nlocal DSS = game:GetService('DataStoreService')\nlocal cashStore = DSS:GetDataStore('CashData')\n\nlocal CashManager = {}\nCashManager._cache = {}\n\nfunction CashManager:Init(player)\n    local key = 'player_' .. player.UserId .. '_cash'\n    local success, cash = pcall(function()\n        return cashStore:GetAsync(key)\n    end)\n    self._cache[player.UserId] = success and cash or 0\nend\n\nfunction CashManager:Get(player)\n    return self._cache[player.UserId] or 0\nend\n\nfunction CashManager:Add(player, amount)\n    self._cache[player.UserId] = (self._cache[player.UserId] or 0) + amount\n    local ls = player:FindFirstChild('leaderstats')\n    if ls and ls:FindFirstChild('Cash') then\n        ls.Cash.Value = self._cache[player.UserId]\n    end\nend\n\nfunction CashManager:Save(player)\n    local key = 'player_' .. player.UserId .. '_cash'\n    pcall(function()\n        cashStore:SetAsync(key, self._cache[player.UserId] or 0)\n    end)\nend\n\nreturn CashManager"
        },
        "inventory_system": {
            "desc": "نظام حقيبة بسيط.",
            "code": "local Inventory = {}\nInventory.__index = Inventory\n\nfunction Inventory.new(maxSize)\n    local self = setmetatable({}, Inventory)\n    self.items = {}\n    self.maxSize = maxSize or 20\n    return self\nend\n\nfunction Inventory:Add(itemName, quantity)\n    quantity = quantity or 1\n    if #self.items >= self.maxSize then\n        warn('Inventory is full!')\n        return false\n    end\n    \n    for _, item in ipairs(self.items) do\n        if item.name == itemName then\n            item.quantity = item.quantity + quantity\n            return true\n        end\n    end\n    \n    table.insert(self.items, {name = itemName, quantity = quantity})\n    return true\nend\n\nfunction Inventory:Remove(itemName, quantity)\n    quantity = quantity or 1\n    for i, item in ipairs(self.items) do\n        if item.name == itemName then\n            item.quantity = item.quantity - quantity\n            if item.quantity <= 0 then\n                table.remove(self.items, i)\n            end\n            return true\n        end\n    end\n    return false\nend\n\nfunction Inventory:Has(itemName, quantity)\n    quantity = quantity or 1\n    for _, item in ipairs(self.items) do\n        if item.name == itemName and item.quantity >= quantity then\n            return true\n        end\n    end\n    return false\nend\n\nfunction Inventory:GetItems()\n    return self.items\nend\n\nreturn Inventory"
        }
    },
    game_patterns: {
        "obby_checkpoint": {
            "desc": "نقاط تفتيش في لعبة عوائق.",
            "code": "local checkpoints = {} -- أضف نقاط التفتيش هنا\n\nlocal function setupCheckpoint(part, checkpointLevel)\n    local touchConn\n    touchConn = part.Touched:Connect(function(hit)\n        local character = hit.Parent\n        local player = game:GetService('Players'):GetPlayerFromCharacter(character)\n        if player then\n            local leaderstats = player:FindFirstChild('leaderstats')\n            if leaderstats and leaderstats:FindFirstChild('Checkpoint') then\n                if checkpointLevel > leaderstats.Checkpoint.Value then\n                    leaderstats.Checkpoint.Value = checkpointLevel\n                    print(player.Name .. ' reached checkpoint ' .. checkpointLevel)\n                end\n            end\n        end\n    end)\nend\n\nfor i, cp in ipairs(workspace.Checkpoints:GetChildren()) do\n    setupCheckpoint(cp, i)\nend"
        },
        "round_system": {
            "desc": "نظام جولات.",
            "code": "local RoundSystem = {}\nRoundSystem.IsRunning = false\nRoundSystem.CurrentRound = 0\nRoundSystem.RoundTime = 120 -- 2 دقيقة\nRoundSystem.Intermission = 15 -- 15 ثانية\n\nfunction RoundSystem:StartRound()\n    self.CurrentRound += 1\n    self.IsRunning = true\n    \n    print('Round ' .. self.CurrentRound .. ' started!')\n    \n    -- انتظار انتهاء الوقت\n    for i = self.RoundTime, 1, -1 do\n        if not self.IsRunning then break end\n        -- تحديث Timer GUI هنا\n        task.wait(1)\n    end\n    \n    self:EndRound()\nend\n\nfunction RoundSystem:EndRound()\n    self.IsRunning = false\n    print('Round ' .. self.CurrentRound .. ' ended!')\n    \n    -- فاصل بين الجولات\n    for i = self.Intermission, 1, -1 do\n        -- تحديث Timer GUI هنا\n        task.wait(1)\n    end\n    \n    self:StartRound()\nend\n\nreturn RoundSystem"
        }
    }
};

// Comprehensive Luau/Roblox API reference for generating code
const ROBLOX_API_DOCS = {
    "workspace:Raycast": {
        "returns": "RaycastResult",
        "params": "(origin: Vector3, direction: Vector3, raycastParams?: RaycastParams)",
        "desc": " launches a ray and returns the first result hit."
    },
    "Instance.new": {
        "returns": "Instance",
        "params": "(className: string, parent?: Instance)",
        "desc": "Creates a new instance of the given class."
    },
    "TweenService:Create": {
        "returns": "Tween",
        "params": "(instance: Instance, tweenInfo: TweenInfo, goal: {})",
        "desc": "Creates a new Tween."
    },
    "DataStoreService:GetDataStore": {
        "returns": "DataStore",
        "params": "(name: string, scope?: string)",
        "desc": "Gets a DataStore for saving/loading data."
    },
    "Players:GetPlayers": {
        "returns": "{Player}",
        "params": "()",
        "desc": "Returns all players in the server."
    },
    "PathfindingService:CreatePath": {
        "returns": "Path",
        "params": "(agentParameters?: {})",
        "desc": "Creates a Path object for pathfinding."
    },
    "game:GetService": {
        "returns": "Service",
        "params": "(serviceName: string)",
        "desc": "Gets a Roblox service by name."
    }
};
