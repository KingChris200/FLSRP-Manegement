const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType,
} = require('discord.js');

const weatherOptions = {
    sunny: {
        label: 'Sunny',
        emoji: '☀️',
        color: 'Gold',
        description:
            'Clear skies and normal driving conditions are currently in effect.',
    },

    cloudy: {
        label: 'Cloudy',
        emoji: '☁️',
        color: 'Grey',
        description:
            'Cloudy conditions are currently active across the server.',
    },

    rainy: {
        label: 'Rainy',
        emoji: '🌧️',
        color: 'Blue',
        description:
            'Rain is currently active. Drive carefully and adjust your roleplay accordingly.',
    },

    stormy: {
        label: 'Stormy',
        emoji: '⛈️',
        color: 'DarkBlue',
        description:
            'Severe weather is currently active. Use caution while driving and responding to scenes.',
    },

    foggy: {
        label: 'Foggy',
        emoji: '🌫️',
        color: 'LightGrey',
        description:
            'Reduced visibility is currently in effect. Please drive carefully.',
    },

    snowy: {
        label: 'Snowy',
        emoji: '🌨️',
        color: 'Aqua',
        description:
            'Snowy conditions are currently active. Roads may be slippery, so use caution.',
    },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Update the current ER:LC server weather.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)

        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Where the weather update should be sent.')
                .addChannelTypes(
                    ChannelType.GuildText,
                    ChannelType.GuildAnnouncement
                )
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('weather')
                .setDescription('The current server weather.')
                .setRequired(true)
                .addChoices(
                    { name: '☀️ Sunny', value: 'sunny' },
                    { name: '☁️ Cloudy', value: 'cloudy' },
                    { name: '🌧️ Rainy', value: 'rainy' },
                    { name: '⛈️ Stormy', value: 'stormy' },
                    { name: '🌫️ Foggy', value: 'foggy' },
                    { name: '🌨️ Snowy', value: 'snowy' }
                )
        )

        .addIntegerOption(option =>
            option
                .setName('temperature')
                .setDescription('Optional temperature in Fahrenheit.')
                .setMinValue(-50)
                .setMaxValue(150)
                .setRequired(false)
        )

        .addIntegerOption(option =>
            option
                .setName('wind-speed')
                .setDescription('Optional wind speed in MPH.')
                .setMinValue(0)
                .setMaxValue(200)
                .setRequired(false)
        )

        .addRoleOption(option =>
            option
                .setName('ping')
                .setDescription('An optional role to notify.')
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName('notes')
                .setDescription('Optional additional weather information.')
                .setMaxLength(1000)
                .setRequired(false)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const weather = interaction.options.getString('weather');
        const temperature = interaction.options.getInteger('temperature');
        const windSpeed = interaction.options.getInteger('wind-speed');
        const pingRole = interaction.options.getRole('ping');
        const notes = interaction.options.getString('notes');

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({
                content: '❌ Please select a valid text channel.',
                ephemeral: true,
            });
        }

        const selectedWeather = weatherOptions[weather];

        if (!selectedWeather) {
            return interaction.reply({
                content: '❌ That weather option is invalid.',
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setColor(selectedWeather.color)
            .setAuthor({
                name: interaction.guild.name,
                iconURL:
                    interaction.guild.iconURL({ dynamic: true }) || undefined,
            })
            .setTitle(
                `${selectedWeather.emoji} Server Weather Updated`
            )
            .setDescription(selectedWeather.description)
            .addFields({
                name: '🌤️ Current Weather',
                value: selectedWeather.label,
                inline: true,
            })
            .setFooter({
                text: `Updated by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL({
                    dynamic: true,
                }),
            })
            .setTimestamp();

        if (temperature !== null) {
            embed.addFields({
                name: '🌡️ Temperature',
                value: `${temperature}°F`,
                inline: true,
            });
        }

        if (windSpeed !== null) {
            embed.addFields({
                name: '💨 Wind Speed',
                value: `${windSpeed} MPH`,
                inline: true,
            });
        }

        if (notes) {
            embed.addFields({
                name: '📝 Additional Information',
                value: notes,
                inline: false,
            });
        }

        try {
            await channel.send({
                content: pingRole ? `${pingRole}` : undefined,
                embeds: [embed],
                allowedMentions: {
                    roles: pingRole ? [pingRole.id] : [],
                },
            });

            await interaction.reply({
                content: `✅ Weather updated to **${selectedWeather.label}** in ${channel}.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Weather command error:', error);

            const response = {
                content:
                    '❌ I could not send the weather update. Check my channel permissions.',
                ephemeral: true,
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(response);
            } else {
                await interaction.reply(response);
            }
        }
    },
};