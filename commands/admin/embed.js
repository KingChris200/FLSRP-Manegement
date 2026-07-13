const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType,
} = require('discord.js');

const embedColors = {
    blue: 'Blue',
    aqua: 'Aqua',
    green: 'Green',
    red: 'Red',
    orange: 'Orange',
    yellow: 'Yellow',
    purple: 'Purple',
    pink: 'LuminousVividPink',
    gold: 'Gold',
    grey: 'Grey',
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Create a custom professional embed.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)

        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel where the embed will be sent.')
                .addChannelTypes(
                    ChannelType.GuildText,
                    ChannelType.GuildAnnouncement
                )
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('title')
                .setDescription('The embed title.')
                .setMaxLength(256)
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('description')
                .setDescription('The main embed message.')
                .setMaxLength(4000)
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('color')
                .setDescription('Choose the embed accent color.')
                .setRequired(false)
                .addChoices(
                    { name: '🔵 Blue', value: 'blue' },
                    { name: '🩵 Aqua', value: 'aqua' },
                    { name: '🟢 Green', value: 'green' },
                    { name: '🔴 Red', value: 'red' },
                    { name: '🟠 Orange', value: 'orange' },
                    { name: '🟡 Yellow', value: 'yellow' },
                    { name: '🟣 Purple', value: 'purple' },
                    { name: '🩷 Pink', value: 'pink' },
                    { name: '🟨 Gold', value: 'gold' },
                    { name: '⚪ Grey', value: 'grey' }
                )
        )

        .addStringOption(option =>
            option
                .setName('image')
                .setDescription('Optional direct image URL.')
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName('thumbnail')
                .setDescription('Optional direct thumbnail image URL.')
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName('footer')
                .setDescription('Optional footer text.')
                .setMaxLength(2048)
                .setRequired(false)
        )

        .addRoleOption(option =>
            option
                .setName('ping')
                .setDescription('Optional role to notify.')
                .setRequired(false)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const title = interaction.options.getString('title');
        const description =
            interaction.options.getString('description');

        const selectedColor =
            interaction.options.getString('color') || 'blue';

        const image = interaction.options.getString('image');
        const thumbnail =
            interaction.options.getString('thumbnail');

        const footer = interaction.options.getString('footer');
        const pingRole = interaction.options.getRole('ping');

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({
                content: '❌ Please select a valid text channel.',
                ephemeral: true,
            });
        }

        const isValidUrl = value => {
            if (!value) return true;

            try {
                const url = new URL(value);

                return (
                    url.protocol === 'https:' ||
                    url.protocol === 'http:'
                );
            } catch {
                return false;
            }
        };

        if (!isValidUrl(image)) {
            return interaction.reply({
                content:
                    '❌ The image URL is invalid. Please use a direct HTTP or HTTPS image link.',
                ephemeral: true,
            });
        }

        if (!isValidUrl(thumbnail)) {
            return interaction.reply({
                content:
                    '❌ The thumbnail URL is invalid. Please use a direct HTTP or HTTPS image link.',
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setColor(embedColors[selectedColor] || 'Blue')
            .setAuthor({
                name: interaction.guild.name,
                iconURL:
                    interaction.guild.iconURL({
                        dynamic: true,
                    }) || undefined,
            })
            .setTitle(title)
            .setDescription(description)
            .setFooter({
                text: footer || 'FLSRP Management',
                iconURL:
                    interaction.client.user.displayAvatarURL(),
            })
            .setTimestamp();

        if (image) {
            embed.setImage(image);
        }

        if (thumbnail) {
            embed.setThumbnail(thumbnail);
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
                content: `✅ Your custom embed was sent successfully in ${channel}.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Embed command error:', error);

            const response = {
                content:
                    '❌ I could not send the embed. Make sure I can view the channel, send messages, and embed links.',
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